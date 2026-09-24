(() => {
  const root = document.documentElement;
  const header = document.querySelector('.site-header');

  /* ---------- Theme toggle ---------- */
  const themeToggle = document.querySelector('.theme-toggle');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
  const currentTheme = () => root.dataset.theme || (prefersDark.matches ? 'dark' : 'light');

  const syncThemeUi = () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    themeToggle.setAttribute('aria-label', `Switch to ${next} theme`);
    themeToggle.title = `Switch to ${next} theme`;

    // Keep the mobile browser bar in sync with a manually chosen theme
    if (root.dataset.theme) {
      const bg = getComputedStyle(root).getPropertyValue('--bg').trim();
      document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => {
        meta.content = bg;
      });
    }
  };

  themeToggle.addEventListener('click', () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try {
      localStorage.setItem('theme', next);
    } catch (e) {
      /* storage unavailable: the choice lasts for this visit only */
    }
    syncThemeUi();
  });

  prefersDark.addEventListener('change', syncThemeUi);
  syncThemeUi();

  /* ---------- Mobile menu ---------- */
  const menuToggle = document.querySelector('.menu-toggle');
  const menu = document.getElementById('nav-menu');

  const setMenuOpen = (open) => {
    header.classList.toggle('is-open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };

  menuToggle.addEventListener('click', () => {
    setMenuOpen(menuToggle.getAttribute('aria-expanded') !== 'true');
  });

  menu.addEventListener('click', (e) => {
    if (e.target.closest('a')) setMenuOpen(false);
  });

  document.addEventListener('click', (e) => {
    if (header.classList.contains('is-open') && !header.contains(e.target)) setMenuOpen(false);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && header.classList.contains('is-open')) {
      setMenuOpen(false);
      menuToggle.focus();
    }
  });

  window.matchMedia('(min-width: 860px)').addEventListener('change', (e) => {
    if (e.matches) setMenuOpen(false);
  });

  /* ---------- Header border on scroll ---------- */
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Highlight the section in view ---------- */
  const navLinks = [...menu.querySelectorAll('a[href^="#"]')];
  const sections = [document.getElementById('top'), ...navLinks.map((a) => document.querySelector(a.hash))].filter(Boolean);

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          navLinks.forEach((a) => {
            if (a.hash === `#${entry.target.id}`) a.setAttribute('aria-current', 'true');
            else a.removeAttribute('aria-current');
          });
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    sections.forEach((section) => observer.observe(section));
  }

  /* ---------- Hero phone: project switcher ---------- */
  const heroScreen = document.getElementById('hero-screen');
  const heroCaption = document.getElementById('hero-caption');
  const switchButtons = document.querySelectorAll('[data-screen]');

  switchButtons.forEach((button) => {
    button.addEventListener('click', () => {
      switchButtons.forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
      heroScreen.src = button.dataset.screen;
      heroScreen.alt = button.dataset.alt;
      heroCaption.textContent = button.dataset.caption;
    });
  });

  /* ---------- Footer year ---------- */
  document.getElementById('year').textContent = new Date().getFullYear();
})();
