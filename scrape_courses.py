import requests
import json

COURSE_CATALOG_URL = "https://tigercenter.rit.edu/tigerCenterApp/tc/courseCatalog"
COURSE_CATALOG_FILE = "raw_course_catalog.json"

def get_course_catalog():
    """Return the raw course catalog data."""
    try:
        # first, try to load the local data file
        with open(COURSE_CATALOG_FILE) as f:
            return json.load(f)
    except FileNotFoundError:
        # the local file doesn't exist yet; download the data and save it
        data = requests.get(COURSE_CATALOG_URL).json()
        with open(COURSE_CATALOG_FILE, "w") as f:
            json.dump(data, f, separators=(",", ":"))
        return data

if __name__ == "__main__":
    get_course_catalog()
