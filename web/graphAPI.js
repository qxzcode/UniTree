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
        const element = cloneTemplate("course-node-template");
        element.querySelector(".code").textContent = nodeID;
        deleteElement(element.querySelector(".name"));
        deleteElement(element.querySelector(".prerequisites"));
        return element;
    } else if (node.type === "course") {
        // a known course
        const element = cloneTemplate("course-node-template");
        element.querySelector(".code").textContent = node.info.code;
        element.querySelector(".name").textContent = node.info.name;
        const prereqs = node.info.prerequisites;
        const prereqsContainer = element.querySelector(".prerequisites");
        if (prereqs === null) {
            deleteElement(prereqsContainer);
        } else {
            prereqsContainer.appendChild(makeNodeElement(prereqs));
        }
        return element;
    } else {
        // a compound node
        const element = cloneTemplate("compound-node-template");
        element.querySelector(".title").textContent = {or: "one", and: "all"}[node.type];
        const childrenContainer = element.querySelector(".children");
        for (const childID of node.children) {
            childrenContainer.appendChild(makeNodeElement(childID));
        }
        return element;
    }
}

function selectCourse(courseCode) {
    console.log("Selecting course: "+courseCode);
    document.getElementById('search-form').style.display = "none";
    
    const graphContainer = document.getElementById("graph-container");
    graphContainer.innerHTML = "";
    graphContainer.appendChild(makeNodeElement(courseCode));
}

// for testing:
//document.addEventListener('DOMContentLoaded', function() {
//    selectCourse("CSCI-243");
//}, false);
