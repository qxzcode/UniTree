import aiohttp
import asyncio
import json

COURSE_CATALOG_URL = "https://tigercenter.rit.edu/tigerCenterApp/tc/courseCatalog"
PREREQUISITES_URL = "https://tigercenter.rit.edu/tigerCenterApp/tc/getPrereq?courseId="

COURSE_CATALOG_FILE = "data/raw_course_catalog.json"
FINAL_COURSES_FILE = "data/courses.json"

async def get_course_catalog(session):
    """Return the raw course catalog data."""
    try:
        # first, try to load the local data file
        with open(COURSE_CATALOG_FILE) as f:
            return json.load(f)
    except FileNotFoundError:
        # the local file doesn't exist yet; download the data and save it
        print("Downloading course catalog...")
        async with session.get(COURSE_CATALOG_URL) as response:
            data = await response.json()
        print("    Done.")
        with open(COURSE_CATALOG_FILE, "w") as f:
            json.dump(data, f, separators=(",", ":"))
        return data

async def get_course_data(session, course):
    """Fetch and return the final course data given a course dict."""
    async with session.get(PREREQUISITES_URL + course["ppSearchId"]) as response:
        prerequisites = (await response.json())["description"]
    return {
        "name": course["courseTitleLong"],
        "code": f'{course["subject"]}-{course["catalogNumber"].strip()}',
        "description": course["courseDescription"],
        "prerequisites": prerequisites,
        "credits": course["credits"],
        "component": course["component"],
        "academicCareer": course["academicCareer"],
        "gradingBasis": course["gradingBasis"],
        "consent": course["consent"],
        "courseTypicallyOff": course.get("courseTypicallyOff", None),
    }

async def download_course_data():
    """Download and save all the course data & prerequisites."""
    connector = aiohttp.TCPConnector(limit=50)
    async with aiohttp.ClientSession(connector=connector) as session:
        catalog = await get_course_catalog(session)
        
        raw_courses = []
        for college in catalog.values():
            for department in college["departments"]:
                for course in department["classes"]:
                    raw_courses.append(course)
        
        print(f"Fetching course prerequisites...")
        total_courses = len(raw_courses)
        fetched_courses = 0
        def print_progress():
            print(f'   {fetched_courses}/{total_courses} ({100*fetched_courses/total_courses:.1f}%)', end='\r')
        async def wrap_get_course(course):
            """Get the course data and print the progress."""
            try:
                result = await get_course_data(session, course)
            except KeyError as e:
                print()
                print()
                print(e)
                print(json.dumps(course, indent=4))
                print()
            nonlocal fetched_courses
            fetched_courses += 1
            print_progress()
            return result
        print_progress()
        course_futures = [wrap_get_course(course) for course in raw_courses]
        courses = await asyncio.gather(*course_futures)
        print()
        
        print(f'Saving to "{FINAL_COURSES_FILE}"...')
        with open(FINAL_COURSES_FILE, "w") as f:
            json.dump(courses, f, separators=(",", ":"))

if __name__ == "__main__":
    asyncio.run(download_course_data())
