/* Animation layer — GSAP + ScrollTrigger (loaded from CDN, see site-footer).
 *
 * Progressive enhancement, strictly:
 *  - No content is ever hidden by CSS. All initial states are set here,
 *    inside the motion gate, so users with reduced motion, JS off, or a
 *    failed CDN load see the complete static page.
 *  - Transforms and opacity only. Nothing that affects layout.
 *  - Every scroll entrance plays once; nothing re-triggers or scrubs.
 */
(function () {
  'use strict';

  var reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  // ── GATE: reduced motion preferred, or GSAP missing → static page ──
  if (reduceQuery.matches) return;
  if (!window.gsap || !window.ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);

  var DUR = 0.6;
  var EASE = 'power2.out';
  var STAGGER = 0.09;

  // Everything this file touches, for cleanup/reveal
  var animated = [];

  // Visibility-based entrances must never remove controls or their labels from
  // keyboard navigation, including when their container is below the viewport.
  var interactive = 'a[href], button, input, select, textarea, summary, [tabindex], [contenteditable]';

  function track(targets) {
    var safe = targets.filter(function (target) {
      return !target.closest(interactive) && !target.querySelector(interactive);
    });
    animated.push.apply(animated, safe);
    return safe;
  }

  // ── 1. Load intro: header, hero (home), page intro (subpages) ──────
  var intro = gsap.timeline({ defaults: { duration: DUR, ease: EASE } });

  var navBits = track(gsap.utils.toArray('.site-nav > *'));
  if (navBits.length) {
    intro.from(navBits, { y: -12, autoAlpha: 0, stagger: 0.06 }, 0);
  }

  var heroRows = track(gsap.utils.toArray('.hero-ed h1 .row'));
  if (heroRows.length) {
    intro.from(heroRows, { y: 20, autoAlpha: 0, stagger: 0.12 }, 0.15);
  }

  var heroMeta = track(gsap.utils.toArray('.hero-meta-top > div'));
  if (heroMeta.length) {
    intro.from(heroMeta, { y: 20, autoAlpha: 0, stagger: STAGGER }, 0.3);
  }

  var heroTail = track(gsap.utils.toArray('.hero-bottom > *'));
  if (heroTail.length) {
    intro.from(heroTail, { y: 20, autoAlpha: 0, stagger: STAGGER }, 0.4);
  }

  var pageIntro = track(gsap.utils.toArray('.page-intro-ed > *'));
  if (pageIntro.length) {
    intro.from(pageIntro, { y: 20, autoAlpha: 0, stagger: STAGGER }, 0.15);
  }

  // ── 2. Scroll entrances (structural elements only, played once) ────
  var scrollTargets = track(gsap.utils.toArray([
    '.home-service',
    '.home-experience > *',
    '.home-personal > *',
    '.home-contact-panel > *',
    '.s-num',
    '.about-ed .pull',
    '.about-body > p',
    '.about-meta > div',
    '.work-head',
    '.case',
    '.services-head > *',
    '.service-ed',
    '.testi-inner > *',
    '.cta-ed .container > *',
    '.contact-ed > *',
    '.work-card',
    '.article-ed'
  ].join(',')));

  if (scrollTargets.length) {
    gsap.set(scrollTargets, { y: 20, autoAlpha: 0 });
    ScrollTrigger.batch(scrollTargets, {
      start: 'top 85%',
      once: true,
      onEnter: function (batch) {
        gsap.to(batch, {
          y: 0,
          autoAlpha: 1,
          duration: DUR,
          ease: EASE,
          stagger: STAGGER,
          overwrite: true
        });
      }
    });
  }

  // ── 3. Page-transition fallback (browsers without View Transitions) ─
  // Incoming fade only — an outgoing fade would delay every navigation.
  var supportsVT = (typeof CSS !== 'undefined' && CSS.supports && CSS.supports('view-transition-name: root'))
    || ('startViewTransition' in document);
  if (!supportsVT) {
    var main = track(gsap.utils.toArray('main'));
    if (main.length) gsap.from(main, { autoAlpha: 0, duration: 0.2, ease: 'none' });
  }

  // ── Reveal everything instantly (no motion, no hidden content) ─────
  function revealAll() {
    intro.kill();
    ScrollTrigger.getAll().forEach(function (t) { t.kill(); });
    gsap.killTweensOf(animated);
    gsap.set(animated, { clearProps: 'opacity,visibility,transform' });
  }

  // ── 4. Honour a live switch to reduced motion ──────────────────────
  function onPreferenceChange(e) {
    if (e.matches) revealAll();
  }
  if (reduceQuery.addEventListener) {
    reduceQuery.addEventListener('change', onPreferenceChange);
  } else if (reduceQuery.addListener) {
    reduceQuery.addListener(onPreferenceChange); // older Safari
  }

  // Printing must never produce half-hidden pages
  window.addEventListener('beforeprint', revealAll);
})();
