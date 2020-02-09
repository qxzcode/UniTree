function cloneTemplate(templateID) {
    return document.getElementById(templateID).content.cloneNode(true);
}

function deleteElement(element) {
    element.parentNode.removeChild(element);
}

function makeNodeElement(nodeID) {
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
        element.querySelector(".code").textContent = node.info.code;
        element.querySelector(".name").textContent = node.info.name;
        element.querySelector(".prerequisites-text").textContent = node.info.prerequisitesText;
        const prereqs = node.info.prerequisites;
        const prereqsContainer = element.querySelector(".prerequisites");
        if (prereqs !== null) {
            prereqsContainer.appendChild(makeNodeElement(prereqs));
        }
        return element;
    } else {
        // a compound node
        const element = cloneTemplate("compound-node-template");
        element.querySelector(".title").textContent = {or: "one of:", and: "all of:"}[node.type];
        const childrenContainer = element.querySelector(".children");
        for (const childID of node.children) {
            const childElement = makeNodeElement(childID);
            if (childElement !== null) {
                childrenContainer.appendChild(childElement);
            }
        }
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
