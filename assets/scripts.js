document.addEventListener('DOMContentLoaded', function () {

  // ── Theme toggle ──────────────────────────────────────────────
  var toggleBtn = document.getElementById('theme-toggle');
  var root = document.documentElement;
  var icon = document.getElementById('theme-icon');

  function applyTheme(t) {
    // Switch colours together; intermediate text/background fades lose contrast.
    root.classList.add('theme-changing');
    root.setAttribute('data-theme', t);
    if (toggleBtn) toggleBtn.setAttribute('aria-pressed', t === 'dark' ? 'true' : 'false');
    if (icon) icon.setAttribute('href', t === 'dark' ? '#icon-sun' : '#icon-moon');
    void root.offsetWidth;
    root.classList.remove('theme-changing');
    try { localStorage.setItem('theme', t); } catch (e) { /* Keep the UI usable without storage. */ }
  }

  // Sync button state with current theme (set in <head> before paint)
  var current = root.getAttribute('data-theme') || 'light';
  if (current !== 'light' && current !== 'dark') current = 'light';
  root.setAttribute('data-theme', current);
  if (toggleBtn) toggleBtn.setAttribute('aria-pressed', current === 'dark' ? 'true' : 'false');
  if (icon) icon.setAttribute('href', current === 'dark' ? '#icon-sun' : '#icon-moon');

  if (toggleBtn) {
    toggleBtn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
    });
  }

  // ── Mobile nav toggle ─────────────────────────────────────────
  var menuBtn = document.getElementById('menu-toggle');
  var navLinks = document.getElementById('primary-nav');

  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', function () {
      var expanded = menuBtn.getAttribute('aria-expanded') === 'true';
      menuBtn.setAttribute('aria-expanded', !expanded ? 'true' : 'false');
      navLinks.classList.toggle('is-open', !expanded);
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (!menuBtn.contains(e.target) && !navLinks.contains(e.target)) {
        menuBtn.setAttribute('aria-expanded', 'false');
        navLinks.classList.remove('is-open');
      }
    });

    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navLinks.classList.contains('is-open')) {
        menuBtn.setAttribute('aria-expanded', 'false');
        navLinks.classList.remove('is-open');
        menuBtn.focus();
      }
    });
  }

  // ── Contact form (Formspree AJAX) ─────────────────────────────
  var contactForm = document.getElementById('contact-form');
  var formSuccess = document.getElementById('form-success');

  if (contactForm && formSuccess) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = contactForm.querySelector('[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Sending…';

      fetch(contactForm.action, {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { 'Accept': 'application/json' }
      })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (data.ok) {
            contactForm.reset();
            formSuccess.classList.add('is-visible');
            formSuccess.focus();
          } else {
            btn.disabled = false;
            btn.textContent = 'Send message';
            alert('Something went wrong. Please try again or email directly.');
          }
        })
        .catch(function () {
          btn.disabled = false;
          btn.textContent = 'Send message';
          alert('Something went wrong. Please try again or email directly.');
        });
    });
  }

});
