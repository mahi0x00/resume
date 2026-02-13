document.addEventListener('DOMContentLoaded', () => {
    // Load resume data from the single source of truth JSON
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
        element.textContent = '';
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

    function debounce(func, wait) {
        let timeout;
        return function (...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }

    function updateHeader() {
        if (window.scrollY > 50) {
            header.classList.add('shrink');
        } else {
            header.classList.remove('shrink');
        }
    }

    window.addEventListener('scroll', debounce(updateHeader, 100));

    const carouselContainer = document.querySelector('.carousel-container');
    const carouselItems = document.querySelectorAll('.carousel-item');

    let currentIndex = 0;

    const controls = document.createElement('div');
    controls.classList.add('carousel-controls');
    document.querySelector('.carousel').appendChild(controls);

    function updateCarousel() {
        if (carouselItems.length > 0) {
            const itemWidth = carouselItems[0].offsetWidth;
            carouselContainer.style.transform = `translateX(-${currentIndex * itemWidth}px)`;
        }
    }

    updateCarousel();
});

/**
 * Loads all resume data from the single source of truth: resumeData.json
 */
function loadResumeData() {
    fetch('resumeData.json')
        .then(response => {
            if (!response.ok) throw new Error('Failed to load resumeData.json');
            return response.json();
        })
        .then(data => {
            // Update page metadata
            if (data.meta) {
                document.title = data.meta.pageTitle || document.title;
                const metaDesc = document.querySelector('meta[name="description"]');
                if (metaDesc && data.meta.pageDescription) {
                    metaDesc.setAttribute('content', data.meta.pageDescription);
                }
                if (data.meta.lastUpdated) {
                    const lastUpdatedEl = document.getElementById('last-updated');
                    if (lastUpdatedEl) {
                        const d = new Date(data.meta.lastUpdated + 'T00:00:00');
                        lastUpdatedEl.textContent = d.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        });
                    }
                }
            }

            // Load all sections
            loadPersonalInfo(data.personal);
            loadAboutSection(data.about);
            loadSkillsCarousel(data.skills);
            loadEducationSection(data.education);
            loadExperienceSection(data.experience);
            loadCertificationsSection(data.certifications, data.credlyBadges);
            loadProjectsSection(data.projects);
            loadToolsSection(data.tools);
            updateFooter(data.personal);
        })
        .catch(error => {
            console.error('Error loading resume data:', error);
        });
}

/**
 * Loads personal information from JSON
 */
function loadPersonalInfo(personal) {
    if (!personal) return;

    document.querySelector('.profile-content h1 .first-name').textContent = personal.firstName;
    document.querySelector('.profile-content h1 .last-name').textContent = personal.lastName;
    document.querySelector('.profile-content .subtitle').textContent = personal.title;
    document.querySelector('.profile-image').src = personal.profileImage;
    document.querySelector('.profile-links a[title="Email"]').href = `mailto:${personal.email}`;
    document.querySelector('.profile-links a[title="GitHub"]').href = `https://github.com/${personal.github}`;
    document.querySelector('.profile-links a[title="LinkedIn"]').href = `https://linkedin.com/in/${personal.linkedin}`;
    document.querySelector('.profile-links a[title="Resume"]').href = personal.resumePdf;

    // Add download button
    const profileLinks = document.querySelector('.profile-links');
    const downloadLink = document.createElement('a');
    downloadLink.href = '#';
    downloadLink.setAttribute('title', 'Download Resume');

    const downloadIcon = document.createElement('i');
    downloadIcon.className = 'fas fa-download';
    downloadLink.appendChild(downloadIcon);

    downloadLink.addEventListener('click', function(e) {
        e.preventDefault();
        if (typeof generateResumePDF === 'function') {
            generateResumePDF();
        } else {
            console.error('PDF generator function not available');
            window.location.href = personal.resumePdf;
        }
    });

    profileLinks.appendChild(downloadLink);
}

/**
 * Loads about section from JSON
 */
function loadAboutSection(aboutItems) {
    if (!aboutItems || !aboutItems.length) return;

    const aboutSection = document.querySelector('.about');
    const sectionHeader = aboutSection.querySelector('.section-header');

    aboutSection.innerHTML = '';
    aboutSection.appendChild(sectionHeader);

    const bulletList = document.createElement('ul');
    bulletList.className = 'about-list';

    aboutItems.forEach(item => {
        const listItem = document.createElement('li');
        listItem.textContent = item;
        bulletList.appendChild(listItem);
    });

    aboutSection.appendChild(bulletList);
}

/**
 * Loads skills carousel from JSON
 */
function loadSkillsCarousel(skills) {
    if (!skills || !skills.length) return;

    const carouselContainer = document.querySelector('.carousel-container');
    carouselContainer.innerHTML = '';

    skills.forEach(skill => {
        const skillItem = document.createElement('div');
        skillItem.className = 'carousel-item';

        const heading = document.createElement('h3');
        heading.textContent = skill.category;
        skillItem.appendChild(heading);

        const bulletList = document.createElement('ul');
        skill.items.forEach(item => {
            const listItem = document.createElement('li');
            listItem.textContent = item;
            bulletList.appendChild(listItem);
        });
        skillItem.appendChild(bulletList);

        carouselContainer.appendChild(skillItem);
    });
}

/**
 * Loads education section from JSON
 */
function loadEducationSection(education) {
    if (!education || !education.length) return;

    const educationSection = document.querySelector('section.education');
    const sectionHeader = educationSection.querySelector('.section-header');
    educationSection.innerHTML = '';
    educationSection.appendChild(sectionHeader);

    education.forEach(degree => {
        const eduItem = document.createElement('div');
        eduItem.className = 'education-item';

        // Logo container
        const logoContainer = document.createElement('div');
        logoContainer.className = 'education-logo-container';

        if (degree.logo) {
            const logoImg = document.createElement('img');
            logoImg.src = degree.logo;
            logoImg.alt = degree.institution + ' logo';
            logoImg.title = degree.institution;
            logoImg.className = 'institution-logo';
            logoContainer.appendChild(logoImg);
        }

        eduItem.appendChild(logoContainer);

        // Content container
        const contentContainer = document.createElement('div');
        contentContainer.className = 'education-content';

        const titleElement = document.createElement('h3');
        titleElement.className = 'education-title';
        titleElement.textContent = degree.title;
        contentContainer.appendChild(titleElement);

        const institutionElement = document.createElement('div');
        institutionElement.className = 'education-institution';
        institutionElement.textContent = degree.institution;
        contentContainer.appendChild(institutionElement);

        const dateLocationElement = document.createElement('div');
        dateLocationElement.className = 'education-date-location';
        dateLocationElement.textContent = degree.period;
        contentContainer.appendChild(dateLocationElement);

        if (degree.location) {
            const locationElement = document.createElement('div');
            locationElement.className = 'education-location';
            locationElement.textContent = degree.location;
            contentContainer.appendChild(locationElement);
        }

        eduItem.appendChild(contentContainer);
        educationSection.appendChild(eduItem);
    });
}

/**
 * Loads experience section from JSON
 */
function loadExperienceSection(experience) {
    if (!experience || !experience.length) return;

    const experienceSection = document.querySelector('section.experience');
    const sectionHeader = experienceSection.querySelector('.section-header');
    experienceSection.innerHTML = '';
    experienceSection.appendChild(sectionHeader);

    experience.forEach(job => {
        const jobElement = document.createElement('div');
        jobElement.className = 'experience-item';

        // Logo container
        const logoContainer = document.createElement('div');
        logoContainer.className = 'experience-logo-container';

        if (job.logo) {
            const logoImg = document.createElement('img');
            logoImg.src = job.logo;
            logoImg.alt = job.company + ' logo';
            logoImg.title = job.company;
            logoImg.className = 'company-logo';
            logoContainer.appendChild(logoImg);
        }

        jobElement.appendChild(logoContainer);

        // Content container
        const contentContainer = document.createElement('div');
        contentContainer.className = 'experience-content';

        const companyElement = document.createElement('div');
        companyElement.className = 'experience-company';
        companyElement.textContent = job.company;
        contentContainer.appendChild(companyElement);

        const titleElement = document.createElement('h3');
        titleElement.className = 'experience-title';
        titleElement.textContent = job.title;
        contentContainer.appendChild(titleElement);

        const dateLocationElement = document.createElement('div');
        dateLocationElement.className = 'experience-date-location';
        dateLocationElement.textContent = job.period;
        contentContainer.appendChild(dateLocationElement);

        if (job.location) {
            const locationElement = document.createElement('div');
            locationElement.className = 'experience-location';
            locationElement.textContent = job.location;
            contentContainer.appendChild(locationElement);
        }

        // Responsibilities
        if (job.responsibilities && job.responsibilities.length > 0) {
            const respList = document.createElement('ul');
            job.responsibilities.forEach(resp => {
                const respItem = document.createElement('li');
                respItem.textContent = resp;
                respList.appendChild(respItem);
            });
            contentContainer.appendChild(respList);
        }

        // Skills tags
        if (job.skills && job.skills.length > 0) {
            const skillsContainer = document.createElement('div');
            skillsContainer.className = 'experience-skills';

            job.skills.forEach(skill => {
                const skillSpan = document.createElement('span');
                skillSpan.textContent = skill;
                skillsContainer.appendChild(skillSpan);
            });

            contentContainer.appendChild(skillsContainer);
        }

        jobElement.appendChild(contentContainer);
        experienceSection.appendChild(jobElement);
    });
}

/**
 * Loads certifications section from JSON
 */
function loadCertificationsSection(certifications, credlyBadges) {
    if (!certifications) return;

    const certsContainer = document.querySelector('.certifications-container');
    certsContainer.innerHTML = '';

    certifications.forEach(cert => {
        const certItem = document.createElement('div');
        certItem.className = 'certification-item';

        // Logo container
        const logoContainer = document.createElement('div');
        logoContainer.className = 'certification-logo-container';

        if (cert.logo) {
            const logoImg = document.createElement('img');
            logoImg.src = cert.logo;
            logoImg.alt = cert.title + ' logo';
            logoImg.title = cert.title;
            logoImg.className = 'certification-logo';
            logoContainer.appendChild(logoImg);
        }

        certItem.appendChild(logoContainer);

        // Content container
        const contentContainer = document.createElement('div');
        contentContainer.className = 'certification-content';

        const certTitle = document.createElement('h3');
        certTitle.textContent = cert.title;
        contentContainer.appendChild(certTitle);

        const certYear = document.createElement('span');
        certYear.className = 'certification-date';
        certYear.textContent = cert.year;
        contentContainer.appendChild(certYear);

        certItem.appendChild(contentContainer);
        certsContainer.appendChild(certItem);
    });

    // Load Credly badges dynamically from JSON
    if (credlyBadges && credlyBadges.length > 0) {
        const certsSection = document.querySelector('section.certifications');
        credlyBadges.forEach(badgeId => {
            const badgeDiv = document.createElement('div');
            badgeDiv.setAttribute('data-iframe-width', '150');
            badgeDiv.setAttribute('data-iframe-height', '270');
            badgeDiv.setAttribute('data-share-badge-id', badgeId);
            badgeDiv.setAttribute('data-share-badge-host', 'https://www.credly.com');
            certsSection.appendChild(badgeDiv);
        });

        // Load the Credly embed script
        const credlyScript = document.createElement('script');
        credlyScript.type = 'text/javascript';
        credlyScript.async = true;
        credlyScript.src = '//cdn.credly.com/assets/utilities/embed.js';
        certsSection.appendChild(credlyScript);
    }
}

/**
 * Loads projects section from JSON
 */
function loadProjectsSection(projects) {
    if (!projects || !projects.length) return;

    const projectsGrid = document.querySelector('.projects-grid');
    projectsGrid.innerHTML = '';

    projects.forEach(project => {
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card';

        const projectTitle = document.createElement('h3');
        projectTitle.textContent = project.title;
        projectCard.appendChild(projectTitle);

        const projectDesc = document.createElement('p');
        projectDesc.textContent = project.description;
        projectCard.appendChild(projectDesc);

        const projectTags = document.createElement('div');
        projectTags.className = 'project-tags';

        project.tags.forEach(tag => {
            const tagSpan = document.createElement('span');
            tagSpan.textContent = tag;
            projectTags.appendChild(tagSpan);
        });

        projectCard.appendChild(projectTags);
        projectsGrid.appendChild(projectCard);
    });
}

/**
 * Loads tools section from JSON
 */
function loadToolsSection(tools) {
    if (!tools || !tools.length) return;

    const toolsContainer = document.getElementById('tools-container');
    if (!toolsContainer) return;

    toolsContainer.innerHTML = '';

    tools.forEach(tool => {
        const toolElement = document.createElement('div');
        toolElement.className = 'tool-item';

        const toolLogo = document.createElement('img');
        toolLogo.src = tool.logo;
        toolLogo.alt = `${tool.name} logo`;
        toolLogo.title = tool.name;
        toolLogo.className = 'tool-logo';

        toolElement.appendChild(toolLogo);
        toolsContainer.appendChild(toolElement);
    });
}

/**
 * Updates footer with name from JSON
 */
function updateFooter(personal) {
    if (!personal) return;

    const name = personal.name || `${personal.firstName} ${personal.lastName}`.trim();
    const footerText = document.querySelector('footer p');
    footerText.innerHTML = `&copy; <span id="current-year">${new Date().getFullYear()}</span> ${name}. All rights reserved.`;
}