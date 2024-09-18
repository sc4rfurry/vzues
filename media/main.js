(function() {
    const vscode = acquireVsCodeApi();

    window.addEventListener('message', event => {
        const message = event.data;
        switch (message.command) {
            case 'update':
                updateVisualization(message.complexity, message.functionComplexities);
                break;
        }
    });

    function updateVisualization(complexity, functionComplexities) {
        const complexityElement = document.getElementById('complexity');
        complexityElement.innerHTML = `<h2>Overall Cyclomatic Complexity: ${complexity}</h2>`;

        const functionComplexitiesElement = document.getElementById('functionComplexities');
        functionComplexitiesElement.innerHTML = '<h2>Function Complexities:</h2>';
        const ul = document.createElement('ul');
        for (const [func, comp] of Object.entries(functionComplexities)) {
            const li = document.createElement('li');
            li.textContent = `${func}: ${comp}`;
            ul.appendChild(li);
        }
        functionComplexitiesElement.appendChild(ul);
    }
})();