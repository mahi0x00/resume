/**
 * Portfolio renderer — loads everything from resumeData.json (single source of truth).
 */
(function () {
  "use strict";

  const ICONS = {
    email:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4.24-8 5.03L4 8.24V6.5l8 5.03 8-5.03v1.74z"/></svg>',
    github:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 .3a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.33-1.76-1.33-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5 1 .1-.78.42-1.31.76-1.61-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.11-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6.01 0c2.29-1.55 3.3-1.23 3.3-1.23.65 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.63-5.49 5.92.43.38.82 1.11.82 2.24v3.32c0 .32.21.7.82.58A12 12 0 0 0 12 .3z"/></svg>',
    linkedin:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z"/></svg>',
    folder:
      '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>',
  };

  function el(tag, cls, html) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (html !== undefined) node.innerHTML = html;
    return node;
  }

  function skillTag(name) {
    return `<span class="skill-tag">${name}</span>`;
  }

  fetch("resumeData.json")
    .then((r) => {
      if (!r.ok) throw new Error("Failed to load resumeData.json");
      return r.json();
    })
    .then((data) => {
      document.title = data.meta.pageTitle || document.title;

      /* ---- Meta description ---- */
      const desc = document.querySelector('meta[name="description"]');
      if (desc && data.meta.pageDescription) desc.content = data.meta.pageDescription;

      /* ---- Hero / personal ---- */
      const p = data.personal;
      const profileImg = document.getElementById("profile-image");
      if (profileImg) {
        profileImg.src = p.profileImage;
        profileImg.alt = p.name;
      }

      /* ---- About ---- */
      const aboutList = document.getElementById("about-list");
      if (aboutList) {
        aboutList.className = "about-list";
        aboutList.innerHTML = data.about
          .map((line) => `<div class="about-item"><span>${line}</span></div>`)
          .join("");
      }

      /* ---- Skills ---- */
      const skillsGrid = document.getElementById("skills-grid");
      if (skillsGrid) {
        skillsGrid.innerHTML = data.skills
          .map(
            (cat) => `
            <div class="skill-card">
              <h3>${cat.category}</h3>
              <div class="skill-tags">
                ${cat.items.map(skillTag).join("")}
              </div>
            </div>`
          )
          .join("");
      }

      /* ---- Experience timeline ---- */
      const timeline = document.getElementById("timeline");
      if (timeline) {
        timeline.innerHTML = data.experience
          .map((job, i) => {
            const logo = job.logo
              ? `<img class="tl-logo" src="${job.logo}" alt="${job.company} logo" loading="lazy" />`
              : "";
            return `
            <div class="tl-item${i === 0 ? " current" : ""}">
              <span class="tl-dot"></span>
              <div class="tl-period">${job.period}</div>
              <div class="tl-head">
                ${logo}
                <div>
                  <div class="tl-title">${job.title}</div>
                  <div class="tl-company">${job.company} · ${job.location}</div>
                </div>
              </div>
              <ul class="resp-list">
                ${job.responsibilities.map((r) => `<li>${r}</li>`).join("")}
              </ul>
              <div class="tl-tags">${(job.skills || []).map(skillTag).join("")}</div>
            </div>`;
          })
          .join("");
      }

      /* ---- Projects ---- */
      const projectsGrid = document.getElementById("projects-grid");
      if (projectsGrid) {
        projectsGrid.innerHTML = data.projects
          .map(
            (prj) => `
            <div class="project-card">
              <div class="project-folder">${ICONS.folder}</div>
              <h3>${prj.title}</h3>
              <p>${prj.description}</p>
              <div class="project-tags">${prj.tags.map((t) => `<span>${t}</span>`).join("")}</div>
            </div>`
          )
          .join("");
      }

      /* ---- Education ---- */
      const eduList = document.getElementById("education-list");
      if (eduList) {
        eduList.innerHTML = data.education
          .map(
            (ed) => `
            <div class="edu-card">
              <img class="edu-logo" src="${ed.logo}" alt="${ed.institution}" loading="lazy" />
              <div class="edu-info">
                <h3>${ed.title}</h3>
                <p>${ed.institution} · ${ed.location}</p>
                <div class="edu-period">${ed.period}</div>
              </div>
            </div>`
          )
          .join("");
      }

      /* ---- Certifications + Credly badges ---- */
      const certs = document.getElementById("certs-container");
      if (certs) {
        certs.innerHTML = data.certifications
          .map(
            (cert) => `
            <div class="cert-chip">
              <img src="${cert.logo}" alt="${cert.title}" loading="lazy" />
              <div>
                <div class="t">${cert.title}</div>
                <div class="y">${cert.year}</div>
              </div>
            </div>`
          )
          .join("");
      }
      const credly = document.getElementById("credly-badges");
      if (credly && (data.credlyBadges || []).length) {
        /* Official Credly embed — renders real badge artwork via their embed script */
        data.credlyBadges.forEach((id) => {
          const badge = document.createElement("div");
          badge.style.display = "inline-block";
          badge.setAttribute("data-iframe-width", "150");
          badge.setAttribute("data-iframe-height", "270");
          badge.setAttribute("data-share-badge-id", id);
          badge.setAttribute("data-share-badge-host", "https://www.credly.com");
          credly.appendChild(badge);
        });
        const s = document.createElement("script");
        s.type = "text/javascript";
        s.async = true;
        s.src = "https://cdn.credly.com/assets/utilities/embed.js";
        document.body.appendChild(s);
      }

      /* ---- Tools (grouped arsenal) ---- */
      const tools = document.getElementById("tools-container");
      if (tools) {
        const groups = data.toolGroups || [
          { category: "", items: data.tools }
        ];
        tools.innerHTML = groups
          .map(
            (g) => `
            <div class="tools-group">
              ${g.category ? `<h3 class="tools-cat mono">${g.category}</h3>` : ""}
              <div class="tools-grid">
                ${g.items
                  .map(
                    (tool) => `
                  <div class="tool-tile">
                    <div class="tool-logo"><img src="${tool.logo}" alt="${tool.name}" loading="lazy"
                         onerror="this.onerror=null;this.style.visibility='hidden';" /></div>
                    <span>${tool.name}</span>
                  </div>`
                  )
                  .join("")}
              </div>
            </div>`
          )
          .join("");
      }

      /* ---- Contact links ---- */
      const links = document.getElementById("contact-links");
      if (links) {
        const items = [
          { href: `mailto:${p.email}`, icon: ICONS.email, label: "Email me", cls: "contact-link primary" },
          { href: `https://github.com/${p.github}`, icon: ICONS.github, label: `github/${p.github}`, cls: "contact-link" },
          { href: `https://linkedin.com/in/${p.linkedin}`, icon: ICONS.linkedin, label: `linkedin/${p.linkedin}`, cls: "contact-link" },
        ];
        links.innerHTML = items
          .map((it) => `<a class="${it.cls}" href="${it.href}" target="_blank" rel="noopener">${it.icon}${it.label}</a>`)
          .join("");
      }

      /* ---- Footer ---- */
      const yearEl = document.getElementById("current-year");
      if (yearEl) yearEl.textContent = new Date().getFullYear();
      const upd = document.getElementById("last-updated");
      if (upd) upd.textContent = data.meta.lastUpdated || "";

      initReveal();
      initCounters();
    })
    .catch((err) => console.error("[portfolio]", err));

  /* ---- Scroll reveal ---- */
  function initReveal() {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08 }
    );
    document.querySelectorAll(".reveal").forEach((n) => obs.observe(n));
  }

  /* ---- Animated counters ---- */
  function initCounters() {
    const nums = document.querySelectorAll(".stat-card .num[data-target]");
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const node = e.target;
          const target = parseInt(node.dataset.target, 10);
          const dur = 1100;
          const t0 = performance.now();
          (function tick(t) {
            const k = Math.min((t - t0) / dur, 1);
            node.textContent = Math.round(target * (1 - Math.pow(1 - k, 3)));
            if (k < 1) requestAnimationFrame(tick);
          })(t0);
          obs.unobserve(node);
        });
      },
      { threshold: 0.4 }
    );
    nums.forEach((n) => obs.observe(n));
  }
})();

/* ============================================================
   Nav behaviour (scroll state, mobile drawer, active link)
   ============================================================ */
(function () {
  "use strict";

  const nav = document.getElementById("nav");
  const burger = document.getElementById("hamburger");
  const navLinks = document.getElementById("nav-links");

  window.addEventListener("scroll", () => {
    nav.classList.toggle("scrolled", window.scrollY > 10);
  }, { passive: true });

  if (burger && navLinks) {
    burger.addEventListener("click", () => {
      const open = navLinks.classList.toggle("open");
      burger.classList.toggle("open", open);
      burger.setAttribute("aria-expanded", String(open));
      document.body.classList.toggle("nav-open", open);
    });

    navLinks.addEventListener("click", (e) => {
      if (e.target.tagName === "A") {
        navLinks.classList.remove("open");
        burger.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
        document.body.classList.remove("nav-open");
      }
    });
  }

  /* Active section highlighting */
  const sections = document.querySelectorAll("main section[id], header[id]");
  const linkMap = new Map();
  document.querySelectorAll(".nav-links a").forEach((a) => {
    linkMap.set(a.getAttribute("href").slice(1), a);
  });
  const secObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        const link = linkMap.get(e.target.id);
        if (!link) return;
        if (e.isIntersecting) {
          linkMap.forEach((l) => l.classList.remove("active"));
          link.classList.add("active");
        }
      });
    },
    { rootMargin: "-40% 0px -55% 0px" }
  );
  sections.forEach((s) => secObs.observe(s));
})();

/* ============================================================
   Particle network hero background (desktop only)
   ============================================================ */
(function () {
  "use strict";

  const canvas = document.getElementById("particles-canvas");
  if (!canvas) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const ctx = canvas.getContext("2d");
  let particles = [];
  let raf;
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  const LINK_DIST = 130;
  const MAX_PARTICLES = 70;

  function resize() {
    const hero = canvas.parentElement;
    canvas.width = hero.offsetWidth * DPR;
    canvas.height = hero.offsetHeight * DPR;
    canvas.style.width = hero.offsetWidth + "px";
    canvas.style.height = hero.offsetHeight + "px";
    const count = Math.min(MAX_PARTICLES, Math.floor((canvas.width * canvas.height) / 26000));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.35 * DPR,
      vy: (Math.random() - 0.5) * 0.35 * DPR,
      r: (Math.random() * 1.4 + 0.6) * DPR,
    }));
  }

  function step() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(56, 189, 248, 0.45)";
      ctx.fill();
    }
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.hypot(dx, dy);
        if (dist < LINK_DIST * DPR) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle =
            "rgba(129, 140, 248," + (0.14 * (1 - dist / (LINK_DIST * DPR))).toFixed(3) + ")";
          ctx.lineWidth = DPR * 0.6;
          ctx.stroke();
        }
      }
    }
    raf = requestAnimationFrame(step);
  }

  resize();
  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else raf = requestAnimationFrame(step);
  });
  step();
})();
