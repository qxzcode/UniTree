import json
import re
from collections import Counter

from lark import Lark, Transformer
parser = Lark.open("prereqs.lark", start="requisites")
class MyTransformer(Transformer):
    requisites = dict
    
    def prerequisites(self, children):
        if children:
            [child] = children
        else:
            child = []
        return ("prerequisites", child)
    def corequisites(self, children):
        if children:
            [child] = children
        else:
            child = []
        return ("corequisites", child)
    
    courses_and = list
    courses_or = list
    
    COURSE = str

transformer = MyTransformer()

def parse_prereqs(prereqs_str):
    tree = parser.parse(prereqs_str)
    return transformer.transform(tree), tree.pretty()

def get_reqs(courses, code):
    prereqs_str = courses[code]["prerequisites"]
    prereqs_str = " ".join(prereqs_str.split())
    return parse_prereqs(prereqs_str)

def list_course(courses, code, indent=1):
    indent_str = "    " * indent
    if code not in courses:
        print(("    " * (indent-1)) + code + " [unknown]\n")
        return
    print(("    " * (indent-1)) + f"{code} ({courses[code]['name']})")
    prereqs_str = courses[code]["prerequisites"].strip()
    prereqs_str = " ".join(prereqs_str.split())
    print(indent_str + prereqs_str)
    reqs, tree_str = get_reqs(courses, code)
    print(indent_str + str(reqs))
    print(indent_str + tree_str.replace('\n', '\n'+indent_str))
    
    matches = []
    def walk(obj):
        if isinstance(obj, str):
            matches.append(obj)
        else:
            for child in obj:
                walk(child)
    for obj in reqs.values():
        walk(obj)
    for match in matches:
        if match == code: continue
        # list_course(courses, match, indent+1)

def main(code):
    with open("data/courses.json") as f:
        courses = json.load(f)
    
    codes = [c["code"] for c in courses]
    courses = {c["code"]: c for c in courses}
    count = 0
    for code in codes:
        if code != "PHYS-211":
            try:
                if not get_reqs(courses, code)[0]["corequisites"]:
                    continue
            except:
                continue
        list_course(courses, code)
        count += 1
        # break
    print(f"{count=}")
    # list_course(courses, code)
    return
    
    arr = [c["prerequisites"].strip() for c in courses]
    counter = Counter(arr)
    for prereqs, count in sorted(counter.items(), key=lambda x: (x[0],-x[1])):
        prereqs = prereqs.replace('\n', '\n\t')
        print(f"{count}x\t{prereqs}")
    print(len(counter))

if __name__ == "__main__":
    import sys
    main(sys.argv[1])
