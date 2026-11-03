const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
if (toggle && nav) {
  const closeMenu = () => {
    nav.classList.remove('open');
    document.body.classList.remove('menu-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Mở menu');
    toggle.querySelector('.menu-toggle-label').textContent = 'Menu';
  };
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    document.body.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Đóng menu' : 'Mở menu');
    toggle.querySelector('.menu-toggle-label').textContent = open ? 'Đóng' : 'Menu';
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav.classList.contains('open')) {
      closeMenu();
      toggle.focus();
    }
  });
  document.addEventListener('click', (event) => {
    if (nav.classList.contains('open') && !event.target.closest('.site-header')) closeMenu();
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 800) closeMenu();
  });
}

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (!prefersReducedMotion.matches && 'IntersectionObserver' in window) {
  const revealItems = document.querySelectorAll(
    '.partners-heading, .section-heading, .about-layout, .contact-banner, .page-hero, .project-detail, .resume-intro, .resume-grid, .contact-grid'
  );
  const revealObserver = new IntersectionObserver((entries, observer) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }
  }, { threshold: 0.08 });
  revealItems.forEach((item) => {
    item.classList.add('reveal-target');
    revealObserver.observe(item);
  });
  document.documentElement.classList.add('has-motion');
}

document.addEventListener('click', (event) => {
  const link = event.target.closest('a[href]');
  if (!link || prefersReducedMotion.matches || event.defaultPrevented ||
      event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ||
      link.target === '_blank') return;

  const destination = new URL(link.href, window.location.href);
  if (destination.origin !== window.location.origin ||
      destination.pathname === window.location.pathname ||
      !destination.pathname.endsWith('.html')) return;

  event.preventDefault();
  document.body.classList.add('page-leave');
  window.setTimeout(() => { window.location.href = destination.href; }, 230);
});

window.addEventListener('pageshow', () => {
  document.body.classList.remove('page-leave');
});

const resumePdfPage = document.querySelector('#resume-pdf-page');
const resumeHtmlPage = document.querySelector('#resume-html-page');
if (resumePdfPage && resumeHtmlPage) {
  fetch('assets/resume/Khac-Thanh-Resume.pdf', { method: 'HEAD' })
    .then((response) => {
      if (response.ok && response.headers.get('content-type')?.includes('pdf')) {
        resumePdfPage.hidden = false;
        resumeHtmlPage.hidden = true;
      }
    })
    .catch(() => {});
}

// Live reload while developing locally: poll this page's HTML, CSS and JS; swap CSS in place, reload for anything else.
if (['127.0.0.1', 'localhost'].includes(window.location.hostname)) {
  const read = (url) => fetch(url, { cache: 'no-store' }).then((r) => r.text()).catch(() => null);
  const sources = () => [
    { url: window.location.pathname, kind: 'page' },
    ...[...document.querySelectorAll('link[rel="stylesheet"]')].map((link) => ({ url: link.href, kind: 'css', link })),
    ...[...document.querySelectorAll('script[src]')].map((script) => ({ url: script.src, kind: 'page' }))
  ];
  const seen = new Map();
  const check = async () => {
    for (const source of sources()) {
      const key = source.url.split('&live=')[0];
      const text = await read(key);
      if (text === null) continue;
      if (seen.has(key) && seen.get(key) !== text) {
        if (source.kind === 'css') {
          const fresh = source.link.cloneNode();
          fresh.href = key + (key.includes('?') ? '&' : '?') + 'live=' + Date.now();
          fresh.onload = () => source.link.remove();
          source.link.after(fresh);
        } else {
          window.location.reload();
          return;
        }
      }
      seen.set(key, text);
    }
  };
  check();
  window.setInterval(check, 1000);
}
