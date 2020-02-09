function cloneTemplate(templateID) {
    return document.getElementById(templateID).content.cloneNode(true);
}

function deleteElement(element) {
    element.parentNode.removeChild(element);
}

let depColors = {};
let nextHue = 0;
const HUE_STEP = 360 * 4/13;
function getCourseColor(courseCode) {
    const depCode = courseCode.slice(0, courseCode.indexOf("-"));
    if (!(depCode in depColors)) {
        depColors[depCode] = `hsla(${nextHue}, 100%, 40%, 0.2)`;
        nextHue += HUE_STEP;
    }
    return depColors[depCode];
}

function makeNodeElement(nodeID, depth = 0) {
    const node = graphNodes[nodeID];
    if (node === undefined) {
        // an unknown course code
        return null;
    } else if (node.type === "course") {
        // a known course
        const element = cloneTemplate("course-node-template");
        element.querySelector(".info-button").addEventListener("click", function() {
            updateModal(node.info.code);
        });
        element.querySelector(".heading").style.backgroundColor = getCourseColor(node.info.code);
        element.querySelector(".code").textContent = node.info.code;
        element.querySelector(".name").textContent = node.info.name;
        element.querySelector(".prerequisites-text").textContent = node.info.prerequisitesText;
        const prereqsElement = makeNodeElement(node.info.prerequisites, depth);
        const prereqsContainer = element.querySelector(".prerequisites");
        if (prereqsElement !== null) {
            prereqsContainer.appendChild(prereqsElement);
        }
        return element;
    } else {
        // a compound node
        const childElements = node.children.map(childID => makeNodeElement(childID, depth+1)).filter(e => e !== null);
        if (childElements.length === 0) {
            return null;
        } else if (childElements.length === 1) {
            return childElements[0];
        }
        
        const element = cloneTemplate("compound-node-template");
        element.querySelector(".title").textContent = {or: "one of:", and: "all of:"}[node.type];
        const mainDiv = element.querySelector(".compound-node");
        if (depth > 2) {
            mainDiv.classList.add("collapsed");
        }
        element.querySelector(".title").addEventListener("click", function() {
            mainDiv.classList.toggle("collapsed");
        });
        const childrenContainer = element.querySelector(".children");
        childElements.forEach(childElement => childrenContainer.appendChild(childElement));
        return element;
    }
}

function selectCourse(courseCode) {
    console.log("Selecting course: "+courseCode);
    document.body.classList.add("viewing-tree");
    
    const graphContainer = document.getElementById("graph-container");
    graphContainer.innerHTML = "";
    graphContainer.appendChild(makeNodeElement(courseCode));
}

// for testing:
/*
document.addEventListener('DOMContentLoaded', function() {
   selectCourse("CSCI-243");
}, false);
//*/
