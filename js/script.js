/**
 * Modern Portfolio — 2026 Redesign
 * Loads all data from resumeData.json
 */

// ── Script Start ──

// ── Navigation scroll effect ──
const nav = document.getElementById('navbar');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  });
}

// ── Mobile Bottom Tab Bar ──
const tabBar = document.querySelector('.mobile-tab-bar');
if (tabBar) {
  // Smooth scroll on tap
  tabBar.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById(a.dataset.section);
      if (target) {
        window.scrollTo({ top: target.offsetTop - 70, behavior: 'smooth' });
      }
    });
  });

  // Highlight active tab based on which section is in view
  const sectionIds = Array.from(tabBar.querySelectorAll('a')).map((a) => a.dataset.section);
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          tabBar.querySelectorAll('a').forEach((a) => a.classList.remove('active'));
          const activeTab = tabBar.querySelector(`a[data-section="${entry.target.id}"]`);
          if (activeTab) activeTab.classList.add('active');
        }
      });
    },
    { rootMargin: '-30% 0px -60% 0px' }
  );

  sectionIds.forEach((id) => {
    const el = document.getElementById(id);
    if (el) sectionObserver.observe(el);
  });
}

// ── Smooth scroll for anchor links ──
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    e.preventDefault();
    const target = document.querySelector(targetId);
    if (target) {
      window.scrollTo({
        top: target.offsetTop - 80,
        behavior: 'smooth',
      });
    }
  });
});

// ── Scroll Reveal Observer ──
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
);

// ── Load resume data ──
loadResumeData();

/**
 * Main data loader
 */
function loadResumeData() {
  fetch('resumeData.json')
    .then((r) => {
      if (!r.ok) throw new Error('Failed to load resumeData.json');
      return r.json();
    })
    .then((data) => {
      renderMeta(data.meta);
      renderHero(data.personal);
      renderExperience(data.experience);
      renderAbout(data.about);
      renderSkills(data.skills);
      renderEducation(data.education);
      renderCertifications(data.certifications, data.credlyBadges);
      renderProjects(data.projects);
      renderTools(data.tools);
      renderFooter(data.personal);

      // Activate reveal animations after DOM is built
      requestAnimationFrame(() => {
        document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));
      });
    });
}

/**
 * Page meta
 */
function renderMeta(meta) {
  if (!meta) return;
  document.title = meta.pageTitle || document.title;
  const desc = document.querySelector('meta[name="description"]');
  if (desc && meta.pageDescription) desc.setAttribute('content', meta.pageDescription);

  const yearEl = document.getElementById('current-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const updatedEl = document.getElementById('last-updated');
  if (updatedEl && meta.lastUpdated) {
    const d = new Date(meta.lastUpdated + 'T00:00:00');
    updatedEl.textContent = d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }
}

/**
 * Hero section
 */
function renderHero(p) {
  if (!p) return;
  document.getElementById('nav-name').textContent = p.firstName.split(' ')[0];
  document.getElementById('hero-first-name').textContent = p.firstName;
  document.getElementById('hero-last-name').textContent = p.lastName;
  document.getElementById('hero-title').textContent = p.title;
  document.getElementById('hero-avatar').src = p.profileImage;
  document.getElementById('hero-avatar').alt = p.name || `${p.firstName} ${p.lastName}`;

  // Social links
  const socials = document.getElementById('hero-socials');
  const socialLinks = [
    { icon: 'fas fa-envelope', href: `mailto:${p.email}`, title: 'Email' },
    { icon: 'fab fa-github', href: `https://github.com/${p.github}`, title: 'GitHub' },
    { icon: 'fab fa-linkedin', href: `https://linkedin.com/in/${p.linkedin}`, title: 'LinkedIn' },
  ];
  socialLinks.forEach((s) => {
    const a = document.createElement('a');
    a.href = s.href;
    a.title = s.title;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.innerHTML = `<i class="${s.icon}"></i>`;
    socials.appendChild(a);
  });
}

/**
 * About — each bullet as a glassmorphic card
 */
function renderAbout(items) {
  if (!items || !items.length) return;
  const grid = document.getElementById('about-grid');

  // Icon mapping for about items
  const icons = [
    'fa-shield-halved', 'fa-gears', 'fa-globe', 'fa-puzzle-piece',
    'fa-robot', 'fa-wand-magic-sparkles', 'fa-microscope', 'fa-lock',
    'fa-bolt', 'fa-eye', 'fa-trophy',
  ];

  items.forEach((item, i) => {
    const card = document.createElement('div');
    card.className = `about-card reveal reveal-delay-${(i % 4) + 1}`;
    card.innerHTML = `
      <div class="card-icon"><i class="fas ${icons[i % icons.length]}"></i></div>
      <p>${item}</p>
    `;
    grid.appendChild(card);
  });
}

/**
 * Skills — grid of category cards
 */
function renderSkills(skills) {
  if (!skills || !skills.length) return;
  const grid = document.getElementById('skills-grid');

  const skillIcons = [
    'fa-clipboard-check', 'fa-pencil-ruler', 'fa-code',
    'fa-vial', 'fa-rocket', 'fa-bell',
  ];

  skills.forEach((cat, i) => {
    const card = document.createElement('div');
    card.className = `skill-card reveal reveal-delay-${(i % 3) + 1}`;
    const listItems = cat.items.map((it) => `<li>${it}</li>`).join('');
    card.innerHTML = `
      <h3>
        <span class="skill-icon"><i class="fas ${skillIcons[i % skillIcons.length]}"></i></span>
        ${cat.category}
      </h3>
      <ul>${listItems}</ul>
    `;
    grid.appendChild(card);
  });
}

/**
 * Experience — vertical timeline
 */
function renderExperience(jobs) {
  if (!jobs || !jobs.length) return;
  const timeline = document.getElementById('experience-timeline');

  jobs.forEach((job, i) => {
    const item = document.createElement('div');
    item.className = `timeline-item reveal reveal-delay-${(i % 3) + 1}`;

    const respHtml = job.responsibilities
      ? job.responsibilities.map((r) => `<li>${r}</li>`).join('')
      : '';

    const skillsHtml = job.skills
      ? job.skills.map((s) => `<span>${s}</span>`).join('')
      : '';

    item.innerHTML = `
      <div class="timeline-header">
        ${job.logo ? `<img src="${job.logo}" alt="${job.company}" class="timeline-logo" />` : ''}
        <div class="timeline-meta">
          <div class="timeline-company">${job.company}</div>
          <div class="timeline-role">${job.title}</div>
          <div class="timeline-date">
            <i class="far fa-calendar"></i> ${job.period}
            ${job.location ? ` · <i class="fas fa-map-marker-alt"></i> ${job.location}` : ''}
          </div>
        </div>
      </div>
      ${respHtml ? `<ul class="timeline-responsibilities">${respHtml}</ul>` : ''}
      ${skillsHtml ? `<div class="timeline-skills">${skillsHtml}</div>` : ''}
    `;
    timeline.appendChild(item);
  });
}

/**
 * Education
 */
function renderEducation(edu) {
  if (!edu || !edu.length) return;
  const grid = document.getElementById('education-grid');

  edu.forEach((deg, i) => {
    const card = document.createElement('div');
    card.className = `education-card reveal reveal-delay-${(i % 2) + 1}`;
    card.innerHTML = `
      ${deg.logo ? `<img src="${deg.logo}" alt="${deg.institution}" class="edu-logo" />` : ''}
      <div class="edu-content">
        <h3>${deg.title}</h3>
        <div class="edu-institution">${deg.institution}</div>
        <div class="edu-meta">
          <i class="far fa-calendar"></i> ${deg.period}
          ${deg.location ? ` · ${deg.location}` : ''}
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

/**
 * Certifications + Credly badges
 */
function renderCertifications(certs, credlyBadges) {
  if (certs && certs.length) {
    const container = document.getElementById('certs-container');
    certs.forEach((cert) => {
      const card = document.createElement('div');
      card.className = 'cert-card reveal';
      card.innerHTML = `
        ${cert.logo ? `<img src="${cert.logo}" alt="${cert.title}" class="cert-logo" />` : ''}
        <div class="cert-info">
          <h3>${cert.title}</h3>
          <span>${cert.year}</span>
        </div>
      `;
      container.appendChild(card);
    });
  }

  if (credlyBadges && credlyBadges.length) {
    const badgeContainer = document.getElementById('credly-badges');
    credlyBadges.forEach((id) => {
      const div = document.createElement('div');
      div.setAttribute('data-iframe-width', '150');
      div.setAttribute('data-iframe-height', '270');
      div.setAttribute('data-share-badge-id', id);
      div.setAttribute('data-share-badge-host', 'https://www.credly.com');
      badgeContainer.appendChild(div);
    });

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = '//cdn.credly.com/assets/utilities/embed.js';
    badgeContainer.appendChild(script);
  }
}

/**
 * Projects
 */
function renderProjects(projects) {
  if (!projects || !projects.length) return;
  const grid = document.getElementById('projects-grid');

  projects.forEach((proj, i) => {
    const card = document.createElement('div');
    card.className = `project-card reveal reveal-delay-${(i % 4) + 1}`;
    const tagsHtml = proj.tags.map((t) => `<span>${t}</span>`).join('');
    card.innerHTML = `
      <h3>${proj.title}</h3>
      <p>${proj.description}</p>
      <div class="project-tags">${tagsHtml}</div>
    `;
    grid.appendChild(card);
  });
}

/**
 * Tools — logo-only grid
 */
function renderTools(tools) {
  if (!tools || !tools.length) return;
  const grid = document.getElementById('tools-grid');

  tools.forEach((tool, i) => {
    const item = document.createElement('div');
    item.className = `tool-item reveal reveal-delay-${(i % 4) + 1}`;
    item.innerHTML = `<img src="${tool.logo}" alt="${tool.name}" title="${tool.name}" />`;
    grid.appendChild(item);
  });
}

/**
 * Footer
 */
function renderFooter(p) {
  if (!p) return;
  const name = p.name || `${p.firstName} ${p.lastName}`.trim();
  document.getElementById('footer-name').textContent = name;

  const socials = document.getElementById('footer-socials');
  const links = [
    { icon: 'fab fa-github', href: `https://github.com/${p.github}` },
    { icon: 'fab fa-linkedin', href: `https://linkedin.com/in/${p.linkedin}` },
    { icon: 'fas fa-envelope', href: `mailto:${p.email}` },
  ];
  links.forEach((s) => {
    const a = document.createElement('a');
    a.href = s.href;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.innerHTML = `<i class="${s.icon}"></i>`;
    socials.appendChild(a);
  });
}