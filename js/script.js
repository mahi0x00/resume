document.addEventListener('DOMContentLoaded', () => {
    // Load resume data from XML
    loadResumeData();
    
    // Update current year in footer
    document.getElementById('current-year').textContent = new Date().getFullYear();

    // Update last updated date in footer
    const lastUpdated = new Date(document.lastModified);
    document.getElementById('last-updated').textContent = lastUpdated.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    // Smooth scrolling for internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 70,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Add hover effect to project cards
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.borderColor = '#58a6ff';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.borderColor = '';
        });
    });

    // Typewriter effect for last name
    const lastNameElement = document.querySelector('.profile-content h1 .last-name');
    const lastName = lastNameElement.textContent;
    lastNameElement.textContent = '';
    
    function typeWriter(text, element, delay = 50) {
        let index = 0;
        element.textContent = ''; // Clear the text content before starting
        function type() {
            if (index < text.length) {
                element.textContent += text.charAt(index);
                index++;
                setTimeout(type, delay);
            }
        }
        type();
    }

    document.querySelector('.profile-content h1').addEventListener('mouseenter', () => {
        lastNameElement.style.visibility = 'visible';
        typeWriter(lastName, lastNameElement);
    });

    // Add scroll event listener to shrink the header
    const header = document.querySelector('header');

    function updateHeader() {
        if (window.scrollY > 50) {
            header.classList.add('shrink');
        } else {
            header.classList.remove('shrink');
        }
    }

    window.addEventListener('scroll', () => {
        requestAnimationFrame(updateHeader);
    });
});

/**
 * Loads resume data from XML file and populates the HTML
 */
function loadResumeData() {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            const xmlDoc = this.responseXML;
            
            // Load personal information
            loadPersonalInfo(xmlDoc);
            
            // Load about section
            loadAboutSection(xmlDoc);
            
            // Load skills section
            loadSkillsSection(xmlDoc);
            
            // Load experience section
            loadExperienceSection(xmlDoc);
            
            // Load projects section
            loadProjectsSection(xmlDoc);
            
            // Load education section
            loadEducationSection(xmlDoc);
            
            // Load certifications section
            loadCertificationsSection(xmlDoc);
            
            // Update footer
            updateFooter(xmlDoc);

            loadToolsSection(xmlDoc); // Add this line
        }
    };
    xhr.open("GET", "resumeData.xml", true);
    xhr.send();
}

/**
 * Loads personal information from XML
 */
function loadPersonalInfo(xmlDoc) {
    const personal = xmlDoc.getElementsByTagName("personal")[0];
    const firstName = personal.getElementsByTagName("firstName")[0].textContent;
    const lastName = personal.getElementsByTagName("lastName")[0].textContent;
    const title = personal.getElementsByTagName("title")[0].textContent;
    const profileImage = personal.getElementsByTagName("profileImage")[0].textContent;
    const email = personal.getElementsByTagName("email")[0].textContent;
    const github = personal.getElementsByTagName("github")[0].textContent;
    const linkedin = personal.getElementsByTagName("linkedin")[0].textContent;
    const resumePdf = personal.getElementsByTagName("resumePdf")[0].textContent;
    
    // Update the DOM with personal information
    document.querySelector('.profile-content h1 .first-name').textContent = firstName;
    document.querySelector('.profile-content h1 .last-name').textContent = lastName;
    document.querySelector('.profile-content .subtitle').textContent = title;
    document.querySelector('.profile-image').src = profileImage;
    document.querySelector('.profile-links a[title="Email"]').href = `mailto:${email}`;
    document.querySelector('.profile-links a[title="GitHub"]').href = `https://github.com/${github}`;
    document.querySelector('.profile-links a[title="LinkedIn"]').href = `https://linkedin.com/in/${linkedin}`;
    document.querySelector('.profile-links a[title="Resume"]').href = resumePdf;
    
    // Add download button
    const profileLinks = document.querySelector('.profile-links');
    const downloadLink = document.createElement('a');
    downloadLink.href = "#"; // Use # as href since we'll handle click with JavaScript
    downloadLink.setAttribute('title', 'Download Resume');
    
    const downloadIcon = document.createElement('i');
    downloadIcon.className = 'fas fa-download';
    downloadLink.appendChild(downloadIcon);
    
    // Add click event to generate PDF
    downloadLink.addEventListener('click', function(e) {
        e.preventDefault();
        if (typeof generateResumePDF === 'function') {
            generateResumePDF();
        } else {
            console.error('PDF generator function not available');
            // Fallback to direct download if PDF generator is not available
            window.location.href = resumePdf;
        }
    });
    
    profileLinks.appendChild(downloadLink);
}

/**
 * Loads about section from XML
 */
function loadAboutSection(xmlDoc) {
    const about = xmlDoc.getElementsByTagName("about")[0];
    const summary = about.getElementsByTagName("summary")[0];
    const points = summary.getElementsByTagName("li");

    // Update the DOM with about information
    const aboutSection = document.querySelector('.about');
    const sectionHeader = aboutSection.querySelector('.section-header');

    // Clear existing content except the header
    aboutSection.innerHTML = '';
    aboutSection.appendChild(sectionHeader);

    // Create a bullet list for the summary points
    if (points.length > 0) {
        const bulletList = document.createElement('ul');
        bulletList.className = 'about-list';

        for (let i = 0; i < points.length; i++) {
            const listItem = document.createElement('li');
            listItem.textContent = points[i].textContent;
            bulletList.appendChild(listItem);
        }

        aboutSection.appendChild(bulletList);
    }
}

/**
 * Loads skills section from XML
 */
function loadSkillsSection(xmlDoc) {
    const skills = xmlDoc.getElementsByTagName("skills")[0];
    const categories = skills.getElementsByTagName("category");
    const skillsContainer = document.querySelector('.skills-container');
    
    // Clear existing skills
    skillsContainer.innerHTML = '';
    
    // Add skills from XML
    for (let i = 0; i < categories.length; i++) {
        const category = categories[i];
        const categoryName = category.getAttribute("name");
        const skillItems = category.getElementsByTagName("skill");
        
        const skillCategory = document.createElement('div');
        skillCategory.className = 'skill-category';
        
        const categoryTitle = document.createElement('h3');
        categoryTitle.textContent = categoryName;
        skillCategory.appendChild(categoryTitle);
        
        const skillsList = document.createElement('ul');
        for (let j = 0; j < skillItems.length; j++) {
            const skillItem = document.createElement('li');
            skillItem.textContent = skillItems[j].textContent;
            skillsList.appendChild(skillItem);
        }
        
        skillCategory.appendChild(skillsList);
        skillsContainer.appendChild(skillCategory);
    }
}

/**
 * Loads experience section from XML
 */
function loadExperienceSection(xmlDoc) {
    const experience = xmlDoc.getElementsByTagName("experience")[0];
    const jobs = experience.getElementsByTagName("job");
    const experienceSection = document.querySelector('section.experience');
    
    // Keep the section header and remove the rest
    const sectionHeader = experienceSection.querySelector('.section-header');
    experienceSection.innerHTML = '';
    experienceSection.appendChild(sectionHeader);
    
    // Add jobs from XML
    for (let i = 0; i < jobs.length; i++) {
        const job = jobs[i];
        const title = job.getElementsByTagName("title")[0].textContent;
        const company = job.getElementsByTagName("company")[0].textContent;
        const locationElement = job.getElementsByTagName("location")[0];
        const location = locationElement ? locationElement.textContent : "";
        const logoElement = job.getElementsByTagName("logo")[0];
        const logo = logoElement ? logoElement.textContent : null;
        const period = job.getElementsByTagName("period")[0].textContent;
        const responsibilities = job.getElementsByTagName("item");
        const skills = job.getElementsByTagName("skill");
        
        const jobElement = document.createElement('div');
        jobElement.className = 'experience-item';
        
        // Logo container
        const logoContainer = document.createElement('div');
        logoContainer.className = 'experience-logo-container';
        
        if (logo) {
            const logoImg = document.createElement('img');
            logoImg.src = logo;
            logoImg.alt = company + ' logo';
            logoImg.title = company;
            logoImg.className = 'company-logo';
            logoContainer.appendChild(logoImg);
        }
        
        jobElement.appendChild(logoContainer);
        
        // Content container
        const contentContainer = document.createElement('div');
        contentContainer.className = 'experience-content';
        
        // Add title
        const titleElement = document.createElement('h3');
        titleElement.className = 'experience-title';
        titleElement.textContent = title;
        contentContainer.appendChild(titleElement);
        
        // Add company
        const companyElement = document.createElement('div');
        companyElement.className = 'experience-company';
        companyElement.textContent = company;
        contentContainer.appendChild(companyElement);
        
        // Add date and location
        const dateLocationElement = document.createElement('div');
        dateLocationElement.className = 'experience-date-location';
        dateLocationElement.textContent = period;
        contentContainer.appendChild(dateLocationElement);
        
        if (location) {
            const locationElement = document.createElement('div');
            locationElement.className = 'experience-location';
            locationElement.textContent = location;
            contentContainer.appendChild(locationElement);
        }
        
        // Add responsibilities
        if (responsibilities.length > 0) {
            const respList = document.createElement('ul');
            for (let j = 0; j < responsibilities.length; j++) {
                const respItem = document.createElement('li');
                respItem.textContent = responsibilities[j].textContent;
                respList.appendChild(respItem);
            }
            contentContainer.appendChild(respList);
        }
        
        // Add skills tags
        if (skills.length > 0) {
            const skillsContainer = document.createElement('div');
            skillsContainer.className = 'experience-skills';
            
            for (let j = 0; j < skills.length; j++) {
                const skillSpan = document.createElement('span');
                skillSpan.textContent = skills[j].textContent;
                skillsContainer.appendChild(skillSpan);
            }
            
            contentContainer.appendChild(skillsContainer);
        }
        
        jobElement.appendChild(contentContainer);
        experienceSection.appendChild(jobElement);
    }
}

/**
 * Loads projects section from XML
 */
function loadProjectsSection(xmlDoc) {
    const projects = xmlDoc.getElementsByTagName("projects")[0];
    const projectItems = projects.getElementsByTagName("project");
    const projectsGrid = document.querySelector('.projects-grid');
    
    // Clear existing projects
    projectsGrid.innerHTML = '';
    
    // Add projects from XML
    for (let i = 0; i < projectItems.length; i++) {
        const project = projectItems[i];
        const title = project.getElementsByTagName("title")[0].textContent;
        const description = project.getElementsByTagName("description")[0].textContent;
        const tags = project.getElementsByTagName("tag");
        
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card';
        
        const projectTitle = document.createElement('h3');
        projectTitle.textContent = title;
        projectCard.appendChild(projectTitle);
        
        const projectDesc = document.createElement('p');
        projectDesc.textContent = description;
        projectCard.appendChild(projectDesc);
        
        const projectTags = document.createElement('div');
        projectTags.className = 'project-tags';
        
        for (let j = 0; j < tags.length; j++) {
            const tagSpan = document.createElement('span');
            tagSpan.textContent = tags[j].textContent;
            projectTags.appendChild(tagSpan);
        }
        
        projectCard.appendChild(projectTags);
        projectsGrid.appendChild(projectCard);
    }
}

/**
 * Loads education section from XML
 */
function loadEducationSection(xmlDoc) {
    const education = xmlDoc.getElementsByTagName("education")[0];
    const degrees = education.getElementsByTagName("degree");
    const educationSection = document.querySelector('section.education');
    
    // Keep the section header and remove the rest
    const sectionHeader = educationSection.querySelector('.section-header');
    educationSection.innerHTML = '';
    educationSection.appendChild(sectionHeader);
    
    // Add education from XML
    for (let i = 0; i < degrees.length; i++) {
        const degree = degrees[i];
        const title = degree.getElementsByTagName("title")[0].textContent;
        const institution = degree.getElementsByTagName("institution")[0].textContent;
        const locationElement = degree.getElementsByTagName("location")[0];
        const location = locationElement ? locationElement.textContent : "";
        const logoElement = degree.getElementsByTagName("logo")[0];
        const logo = logoElement ? logoElement.textContent : null;
        const period = degree.getElementsByTagName("period")[0].textContent;
        
        const eduItem = document.createElement('div');
        eduItem.className = 'education-item';
        
        // Logo container
        const logoContainer = document.createElement('div');
        logoContainer.className = 'education-logo-container';
        
        if (logo) {
            const logoImg = document.createElement('img');
            logoImg.src = logo;
            logoImg.alt = institution + ' logo';
            logoImg.title = institution;
            logoImg.className = 'institution-logo';
            logoContainer.appendChild(logoImg);
        }
        
        eduItem.appendChild(logoContainer);
        
        // Content container
        const contentContainer = document.createElement('div');
        contentContainer.className = 'education-content';
        
        // Add title
        const titleElement = document.createElement('h3');
        titleElement.className = 'education-title';
        titleElement.textContent = title;
        contentContainer.appendChild(titleElement);
        
        // Add institution
        const institutionElement = document.createElement('div');
        institutionElement.className = 'education-institution';
        institutionElement.textContent = institution;
        contentContainer.appendChild(institutionElement);
        
        // Add date and location
        const dateLocationElement = document.createElement('div');
        dateLocationElement.className = 'education-date-location';
        dateLocationElement.textContent = period;
        contentContainer.appendChild(dateLocationElement);
        
        if (location) {
            const locationElement = document.createElement('div');
            locationElement.className = 'education-location';
            locationElement.textContent = location;
            contentContainer.appendChild(locationElement);
        }
        
        eduItem.appendChild(contentContainer);
        educationSection.appendChild(eduItem);
    }
}

/**
 * Loads certifications section from XML
 */
function loadCertificationsSection(xmlDoc) {
    const certifications = xmlDoc.getElementsByTagName("certifications")[0];
    const certItems = certifications.getElementsByTagName("certification");
    const certsContainer = document.querySelector('.certifications-container');
    
    // Clear existing certifications
    certsContainer.innerHTML = '';
    
    // Add certifications from XML
    for (let i = 0; i < certItems.length; i++) {
        const cert = certItems[i];
        const title = cert.getElementsByTagName("title")[0].textContent;
        const year = cert.getElementsByTagName("year")[0].textContent;
        const logoElement = cert.getElementsByTagName("logo")[0];
        const logo = logoElement ? logoElement.textContent : null;
        
        const certItem = document.createElement('div');
        certItem.className = 'certification-item';
        
        // Logo container
        const logoContainer = document.createElement('div');
        logoContainer.className = 'certification-logo-container';
        
        if (logo) {
            const logoImg = document.createElement('img');
            logoImg.src = logo;
            logoImg.alt = title + ' logo';
            logoImg.title = title;
            logoImg.className = 'certification-logo';
            logoContainer.appendChild(logoImg);
        }
        
        certItem.appendChild(logoContainer);
        
        // Content container
        const contentContainer = document.createElement('div');
        contentContainer.className = 'certification-content';
        
        const certTitle = document.createElement('h3');
        certTitle.textContent = title;
        contentContainer.appendChild(certTitle);
        
        const certYear = document.createElement('span');
        certYear.className = 'certification-date';
        certYear.textContent = year;
        contentContainer.appendChild(certYear);
        
        certItem.appendChild(contentContainer);
        certsContainer.appendChild(certItem);
    }
}

/**
 * Loads tools section from XML
 */
function loadToolsSection(xmlDoc) {
    const tools = xmlDoc.getElementsByTagName("tools")[0];
    const toolItems = tools.getElementsByTagName("tool");
    const toolsContainer = document.querySelector('.tools-container');
    
    // Clear existing tools
    toolsContainer.innerHTML = '';
    
    // Add tools from XML
    for (let i = 0; i < toolItems.length; i++) {
        const tool = toolItems[i];
        const name = tool.getElementsByTagName("name")[0].textContent;
        const logo = tool.getElementsByTagName("logo")[0].textContent;
        
        const toolItem = document.createElement('div');
        toolItem.className = 'tool-item';
        
        const toolLogo = document.createElement('img');
        toolLogo.src = logo;
        toolLogo.alt = name + ' logo';
        toolLogo.className = 'tool-logo';
        
        const toolName = document.createElement('p');
        toolName.textContent = name;
        
        toolItem.appendChild(toolLogo);
        toolItem.appendChild(toolName);
        toolsContainer.appendChild(toolItem);
    }
}

/**
 * Updates footer with name from XML
 */
function updateFooter(xmlDoc) {
    const personal = xmlDoc.getElementsByTagName("personal")[0];
    const name = personal.getElementsByTagName("name")[0].textContent;
    
    const footerText = document.querySelector('footer p');
    footerText.innerHTML = `&copy; <span id="current-year">${new Date().getFullYear()}</span> ${name}. All rights reserved.`;
}