// ===== Navigation =====
function initNav() {
  const toggle = document.querySelector(".nav-toggle");
  const links = document.getElementById("nav-links");
  if (!toggle || !links) return;

  function setOpen(open) {
    links.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  toggle.addEventListener("click", () => setOpen(!links.classList.contains("open")));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && links.classList.contains("open")) {
      setOpen(false);
      toggle.focus();
    }
  });

  // Tapping outside the header closes the phone menu
  document.addEventListener("click", (e) => {
    if (links.classList.contains("open") && !e.target.closest(".nav-bar")) setOpen(false);
  });
}

// ===== Rendering =====
function serviceCard(service, { compact = false } = {}) {
  const points = compact
    ? ""
    : `<ul>${service.points.map((p) => `<li>${p}</li>`).join("")}</ul>`;
  return `
    <article class="card service-card" id="${service.id}">
      <div class="service-icon">${ICONS[service.icon]}</div>
      <h3>${service.title}</h3>
      <p>${service.summary}</p>
      ${points}
    </article>`;
}

function projectCard(project) {
  return `
    <article class="card project-card">
      <div class="project-thumb"><img src="${project.image}" alt="" loading="lazy" width="640" height="360"></div>
      <div class="project-body">
        <div class="project-meta"><span class="tag tag-accent">${project.categoryLabel}</span><span class="tag">${project.location}</span></div>
        <h3><button type="button" class="project-open" data-project="${project.id}" aria-haspopup="dialog">${project.title}</button></h3>
        <p>${project.summary}</p>
        <span class="project-more" aria-hidden="true">View case study →</span>
      </div>
    </article>`;
}

function renderServices() {
  const full = document.getElementById("services-list");
  if (full) full.innerHTML = SERVICES.map((s) => serviceCard(s)).join("");

  const preview = document.getElementById("services-preview");
  if (preview) preview.innerHTML = SERVICES.map((s) => serviceCard(s, { compact: true })).join("");
}

function renderProjects(filter = "all") {
  const featured = document.getElementById("featured-projects");
  if (featured) featured.innerHTML = PROJECTS.filter((p) => p.featured).map(projectCard).join("");

  const grid = document.getElementById("projects-grid");
  if (!grid) return;
  const list = filter === "all" ? PROJECTS : PROJECTS.filter((p) => p.category === filter);
  grid.innerHTML = list.length
    ? list.map(projectCard).join("")
    : `<p class="empty-note">No projects in this category yet.</p>`;

  const count = document.getElementById("projects-count");
  if (count) count.textContent = `${list.length} project${list.length === 1 ? "" : "s"} shown`;
}

// ===== Project filter =====
function initFilters() {
  const bar = document.getElementById("project-filters");
  if (!bar) return;
  bar.addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-btn");
    if (!btn) return;
    bar.querySelectorAll(".filter-btn").forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
    renderProjects(btn.dataset.filter);
  });
}

// ===== Project dialog =====
function initProjectDialog() {
  const dialog = document.getElementById("project-dialog");
  if (!dialog) return;
  const content = dialog.querySelector(".dialog-content");
  let opener = null;

  document.addEventListener("click", (e) => {
    const card = e.target.closest("[data-project]");
    if (!card) return;
    const project = PROJECTS.find((p) => p.id === card.dataset.project);
    if (!project) return;
    opener = card;
    content.innerHTML = `
      <div class="dialog-thumb"><img src="${project.image}" alt=""></div>
      <div class="dialog-body">
        <div class="project-meta"><span class="tag tag-accent">${project.categoryLabel}</span></div>
        <h2 id="dialog-title">${project.title}</h2>
        <p>${project.summary}</p>
        <dl class="detail-list">
          <dt>Location</dt><dd>${project.location}</dd>
          <dt>Role</dt><dd>${project.role}</dd>
          <dt>Period</dt><dd>${project.period}</dd>
          <dt>Standards</dt><dd>${project.standards}</dd>
          <dt>Tools</dt><dd>${project.tools}</dd>
        </dl>
        <h3>Scope of work</h3>
        <ul>${project.scope.map((s) => `<li>${s}</li>`).join("")}</ul>
        <h3>Outcome</h3>
        <p>${project.outcome}</p>
      </div>`;
    markPlaceholders(content);
    dialog.showModal();
  });

  dialog.querySelector(".dialog-close").addEventListener("click", () => dialog.close());
  // Clicking the dim backdrop closes the dialog
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) dialog.close();
  });
  dialog.addEventListener("close", () => {
    if (opener) opener.focus();
  });
}

// Highlight "[Add ...]" text so placeholders are easy to spot and replace
function markPlaceholders(root = document.body) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) {
    const n = walker.currentNode;
    if (/\[Add[^\]]*\]/.test(n.nodeValue) && !n.parentElement.closest(".placeholder, script, style, option, textarea")) nodes.push(n);
  }
  nodes.forEach((node) => {
    const span = document.createElement("span");
    span.innerHTML = node.nodeValue
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/\[Add[^\]]*\]/g, (m) => `<span class="placeholder">${m}</span>`);
    node.replaceWith(...span.childNodes);
  });
}

// ===== Contact form =====
// Submissions go to the N8N webhook in SITE_CONFIG.contactWebhookUrl (js/config.js).
function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;
  const status = document.getElementById("form-status");

  const rules = {
    name: (v) => (v.trim().length >= 2 ? "" : "Please enter your name."),
    email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "Please enter a valid email address."),
    service: (v) => (v ? "" : "Please choose a service."),
    message: (v) => (v.trim().length >= 10 ? "" : "Please write at least 10 characters about your project."),
  };

  function validateField(name) {
    const input = form.elements[name];
    const error = rules[name](input.value);
    const field = input.closest(".field");
    field.classList.toggle("invalid", Boolean(error));
    input.setAttribute("aria-invalid", String(Boolean(error)));
    field.querySelector(".field-error").textContent = error;
    return !error;
  }

  Object.keys(rules).forEach((name) => {
    form.elements[name].addEventListener("blur", () => validateField(name));
    form.elements[name].addEventListener("input", () => {
      if (form.elements[name].closest(".field").classList.contains("invalid")) validateField(name);
    });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    status.hidden = true;
    const results = Object.keys(rules).map(validateField);
    if (results.includes(false)) {
      const firstBad = form.querySelector(".field.invalid input, .field.invalid select, .field.invalid textarea");
      if (firstBad) firstBad.focus();
      return;
    }

    const data = {};
    for (const [key, value] of new FormData(form).entries()) data[key] = String(value).trim();
    // Honeypot: real visitors never see or fill the "website" field
    if (data.website) {
      form.reset();
      showStatus("success", "Thank you! Your message has been received.");
      return;
    }
    delete data.website;
    data.submittedAt = new Date().toISOString();

    const webhook = typeof SITE_CONFIG !== "undefined" ? SITE_CONFIG.contactWebhookUrl : "";
    if (!webhook) {
      showStatus("error", "The contact form isn't connected yet. Please try again later.");
      return;
    }

    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    button.textContent = "Sending…";

    try {
      const res = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      form.reset();
      showStatus("success", `Thank you, ${data.name.split(/\s+/)[0]}! Your message has been received. I will reply within 1–2 working days.`);
    } catch (err) {
      showStatus("error", "Sorry, your message could not be sent. Please try again in a moment.");
    } finally {
      button.disabled = false;
      button.textContent = "Send Message";
    }
  });

  function showStatus(type, text) {
    status.className = `form-status ${type}`;
    status.textContent = text;
    status.hidden = false;
    status.focus();
  }
}

// ===== Footer year =====
function initYear() {
  document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
}

document.addEventListener("DOMContentLoaded", () => {
  initNav();
  renderServices();
  renderProjects();
  initFilters();
  initProjectDialog();
  initContactForm();
  initYear();
  markPlaceholders();
});
