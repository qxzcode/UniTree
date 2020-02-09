document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.querySelector('.search-input');
    const suggestionsPanel = document.querySelector('.suggestions');
    
    const courseCodes = Object.keys(graphNodes).filter(id => !id.startsWith("*"));
    
    searchInput.addEventListener('input', function() {
        const input = searchInput.value.toLowerCase();
        suggestionsPanel.innerHTML = '';
        const suggestions = courseCodes.filter(function(courseCode) {
            const terms = [courseCode, graphNodes[courseCode].info.name];
            return terms.some(term => term.toLowerCase().startsWith(input));
        }).slice(0, 5);
        suggestions.forEach(function(courseCode) {
            const div = document.createElement('div');
            div.textContent = `${graphNodes[courseCode].info.name} (${courseCode})`;
            suggestionsPanel.appendChild(div);
        });
        if (input === '') {
            suggestionsPanel.innerHTML = '';
        }
    });
}, false);
