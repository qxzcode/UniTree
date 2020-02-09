import json
import re
from collections import Counter
from tqdm import tqdm

from lark import Lark, Transformer
from lark.exceptions import LarkError
parser = Lark.open("prereqs.lark", start="requisites")
def to_node_tuple(type_):
    def func(self, children):
        assert isinstance(children, list) and len(children) > 1
        return (type_, children)
    return func
class MyTransformer(Transformer):
    requisites = dict
    
    def prerequisites(self, children):
        if children:
            [child] = children
        else:
            child = None
        return ("prerequisites", child)
    def corequisites(self, children):
        if children:
            [child] = children
        else:
            child = None
        return ("corequisites", child)
    
    courses_and = to_node_tuple("and")
    courses_or = to_node_tuple("or")
    
    def COURSE(self, code):
        return ("course", str(code))

transformer = MyTransformer()

def fix_prereqs_str(prereqs_str):
    prereqs_str = "\n".join(" ".join(line.split()) for line in prereqs_str.split("\n")) # remove excess whitespace
    return prereqs_str

def parse_prereqs(prereqs_str, return_tree=False):
    tree = parser.parse(fix_prereqs_str(prereqs_str))
    reqs_data = transformer.transform(tree)
    if return_tree:
        return reqs_data, tree.pretty()
    else:
        return reqs_data

def get_reqs(courses, code):
    prereqs_str = courses[code]["prerequisites"]
    return parse_prereqs(prereqs_str, return_tree=True)

def list_course(courses, code, indent=1):
    indent_str = "    " * indent
    if code not in courses:
        print(("    " * (indent-1)) + code + " [unknown]\n")
        return
    print(("    " * (indent-1)) + f"{code} ({courses[code]['name']})")
    prereqs_str = fix_prereqs_str(courses[code]["prerequisites"])
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

def main():
    print("Loading data file...")
    with open("data/courses.json") as f:
        courses = json.load(f)
    
    print("Parsing & building prerequisite graph...")
    nodes = {}
    logical_node_ids = {}
    next_logical_node_id = 1
    def get_node_id(node):
        nonlocal next_logical_node_id
        if node is None:
            return None
        type_, data = node
        if type_ == "course":
            return data  # data is the course code
        else:
            children_ids = [get_node_id(child) for child in data]
            key = (type_, tuple(children_ids))
            new_id = f"*{next_logical_node_id}"
            real_id = logical_node_ids.setdefault(key, new_id)
            if real_id == new_id:
                next_logical_node_id += 1
                nodes[real_id] = {"type": type_, "children": children_ids}
            return real_id
    for course in tqdm(courses):
        course["prerequisites"] = fix_prereqs_str(course["prerequisites"])
        try:
            reqs = parse_prereqs(course["prerequisites"])
        except LarkError:
            reqs = {"prerequisites": None, "corequisites": None}
        except:
            print(course["prerequisites"])
            raise
        
        course["prerequisitesText"] = course["prerequisites"]
        del course["prerequisites"]
        course.update({key: get_node_id(node) for key, node in reqs.items()})
        nodes[course["code"]] = {"type": "course", "info": course}
    
    OUTPUT_FILE = "web/graph_nodes.json"
    print(f'Saving to "{OUTPUT_FILE}"...')
    with open(OUTPUT_FILE, "w") as f:
        # json.dump(nodes, f, separators=(",", ":"))
        json.dump(nodes, f, indent=4)
    quit()
    
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
    main()
