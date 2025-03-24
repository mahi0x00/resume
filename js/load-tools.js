document.addEventListener('DOMContentLoaded', () => {
    fetch('tools.json')
        .then(response => {
            console.log('Fetch response:', response);
            return response.json();
        })
        .then(data => {
            console.log('Tools data:', data);
            const toolsContainer = document.getElementById('tools-container');
            if (!toolsContainer) {
                console.error('Tools container not found');
                return;
            }
            data.tools.forEach(tool => {
                const toolElement = document.createElement('div');
                toolElement.className = 'tool-item';
                
                const toolLogo = document.createElement('img');
                toolLogo.src = tool.logo;
                toolLogo.alt = `${tool.name} logo`;
                toolLogo.className = 'tool-logo';
                
                // Determine if the logo is horizontal or vertical based on aspect ratio
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
