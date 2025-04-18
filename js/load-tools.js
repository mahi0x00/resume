document.addEventListener('DOMContentLoaded', () => {
    fetch('tools.json') // Ensure this path is correct relative to your HTML file
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch tools.json');
            return response.json();
        })
        .then(data => {
            const toolsContainer = document.getElementById('tools-container');
            if (!toolsContainer) {
                console.error('Tools container not found');
                return;
            }
            toolsContainer.innerHTML = '';
            data.tools.forEach(tool => {
                const toolElement = document.createElement('div');
                toolElement.className = 'tool-item';
                
                const toolLogo = document.createElement('img');
                toolLogo.src = tool.logo;
                toolLogo.alt = `${tool.name} logo`;
                toolLogo.className = 'tool-logo';
                toolLogo.onload = () => {
                    if (toolLogo.naturalWidth > toolLogo.naturalHeight) {
                        toolLogo.classList.add('horizontal');
                    } else {
                        toolLogo.classList.add('vertical');
                    }
                };
                
                toolElement.appendChild(toolLogo);
                toolsContainer.appendChild(toolElement);
            });
        })
        .catch(error => console.error('Error loading tools:', error));
});
