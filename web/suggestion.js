document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search-input');
    const searchForm = document.getElementById('search-form');
    const suggestionsPanel = document.getElementById('suggestions');
    
    const courseCodes = Object.keys(graphNodes).filter(id => !id.startsWith("*"));
    
    searchInput.addEventListener('input', function() {
        const input = searchInput.value.trim().toLowerCase();
        suggestionsPanel.innerHTML = '';
        const suggestions = courseCodes.filter(function(courseCode) {
            const terms = [courseCode, graphNodes[courseCode].info.name];
            return terms.some(term => term.toLowerCase().includes(input));
        }).slice(0, 5);
        suggestions.forEach(function(courseCode) {
            const div = document.createElement('div');
            div.textContent = `${courseCode.replace('-', ' ')} - ${graphNodes[courseCode].info.name}`;
            suggestionsPanel.appendChild(div);
        });
        if (input === '' || input === '-') {
            suggestionsPanel.innerHTML = '';
        }
    });
}, false);
