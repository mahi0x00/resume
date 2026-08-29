/**
 * Generates a PDF from the resume HTML content
 */
function generateResumePDF() {
    // Show a loading indicator
    const loadingIndicator = document.createElement('div');
    loadingIndicator.style.position = 'fixed';
    loadingIndicator.style.top = '0';
    loadingIndicator.style.left = '0';
    loadingIndicator.style.width = '100%';
    loadingIndicator.style.height = '100%';
    loadingIndicator.style.backgroundColor = 'rgba(0,0,0,0.7)';
    loadingIndicator.style.zIndex = '9999';
    loadingIndicator.style.display = 'flex';
    loadingIndicator.style.justifyContent = 'center';
    loadingIndicator.style.alignItems = 'center';
    loadingIndicator.style.color = 'white';
    loadingIndicator.style.fontSize = '20px';
    loadingIndicator.innerHTML = '<div>Generating PDF... please wait</div>';
    document.body.appendChild(loadingIndicator);
    
    // Get only the main content for conversion rather than entire body
    const element = document.querySelector('header, main');
    
    // Create a unique filename with the person's name
    const nameElement = document.querySelector('.profile-content h1');
    const name = nameElement ? nameElement.textContent.trim().replace(/\s+/g, '_') : 'resume';
    
    // Define PDF options with reduced quality settings for speed
    const options = {
        margin: 10,
        filename: `${name}_resume.pdf`,
        image: { type: 'jpeg', quality: 0.8 }, // Reduced quality
        html2canvas: { 
            scale: 1.5, // Reduced scale
            useCORS: true,
            logging: false
        },
        jsPDF: { 
            unit: 'mm', 
            format: 'a4', 
            orientation: 'portrait',
            compress: true // Enable compression
        },
        pagebreak: { mode: ['avoid-all'] } // Simplified pagebreak rules
    };
    
    // Create a streamlined version for PDF export
    const container = document.createElement('div');
    container.innerHTML = `
        <header>${document.querySelector('header').innerHTML}</header>
        <main>${document.querySelector('main').innerHTML}</main>
    `;
    
    // Clean up the container
    container.querySelectorAll('.theme-toggle-container, .theme-toggle, .profile-links a[title="Download Resume"], .profile-links a[title="Resume"]').forEach(el => {
        el.style.display = 'none';
    });
    
    // Simplify styles
    container.classList.add('light-theme');
    
    // Add basic inline styles for consistency
    const inlineStyles = `
        <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 100%; }
            h1, h2, h3 { margin-top: 0; }
            section { margin-bottom: 15px; }
            .project-card, .experience-item, .education-item { page-break-inside: avoid; }
        </style>
    `;
    container.innerHTML = inlineStyles + container.innerHTML;
    
    // Use timeout to allow UI to update before starting heavy processing
    setTimeout(() => {
        try {
            html2pdf()
                .from(container)
                .set(options)
                .save()
                .then(() => {
                    document.body.removeChild(loadingIndicator);
                })
                .catch(error => {
                    console.error('Error generating PDF:', error);
                    document.body.removeChild(loadingIndicator);
                    alert('Error generating PDF. Please try again or use the standard resume link.');
                });
        } catch (error) {
            console.error('PDF generation failed:', error);
            document.body.removeChild(loadingIndicator);
            alert('PDF generation failed. Please try again or use the standard resume link.');
        }
    }, 100);
}

// PDF download click is handled in script.js where the button is created.
// No duplicate listener needed here.