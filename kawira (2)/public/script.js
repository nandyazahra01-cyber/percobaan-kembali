document.addEventListener('DOMContentLoaded', () => {
  const topbar = document.querySelector('.topbar');
  const navigation = document.querySelector('.main-nav');
  const menuToggle = document.querySelector('.menu-toggle');
  const navBackdrop = document.querySelector('.nav-backdrop');
  const navLinks = navigation.querySelectorAll('a');
  const navSections = [...navLinks]
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  const setActiveLink = (sectionId) => {
    navLinks.forEach((link) => {
      const isActive = link.hash === `#${sectionId}`;
      link.classList.toggle('active', isActive);
      if (isActive) {
        link.setAttribute('aria-current', 'location');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  };

  const closeNavigation = (returnFocus = false) => {
    navigation.classList.remove('is-open');
    topbar.classList.remove('menu-open');
    navBackdrop.hidden = true;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Buka navigasi');
    if (returnFocus) menuToggle.focus({ preventScroll: true });
  };

  menuToggle.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Buka navigasi' : 'Tutup navigasi');
    navigation.classList.toggle('is-open', !isOpen);
    topbar.classList.toggle('menu-open', !isOpen);
    navBackdrop.hidden = isOpen;
  });

  navBackdrop.addEventListener('click', () => closeNavigation(true));

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      setActiveLink(link.hash.slice(1));
      closeNavigation();
      menuToggle.focus({ preventScroll: true });
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
      closeNavigation(true);
    }
  });

  document.addEventListener('click', (event) => {
    if (
      menuToggle.getAttribute('aria-expanded') === 'true' &&
      !navigation.contains(event.target) &&
      !menuToggle.contains(event.target)
    ) {
      closeNavigation();
    }
  });

  window.matchMedia('(min-width: 761px)').addEventListener('change', (event) => {
    if (event.matches) closeNavigation();
  });

  let scrollScheduled = false;
  window.addEventListener('scroll', () => {
    if (scrollScheduled) return;
    scrollScheduled = true;
    window.requestAnimationFrame(() => {
      topbar.classList.toggle('is-scrolled', window.scrollY > 8);
      scrollScheduled = false;
    });
  }, { passive: true });

  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      const currentSection = entries
        .filter((entry) => entry.isIntersecting)
        .sort((first, second) => first.boundingClientRect.top - second.boundingClientRect.top)[0];
      if (currentSection) setActiveLink(currentSection.target.id);
    }, { rootMargin: '-96px 0px -62% 0px', threshold: 0 });

    navSections.forEach((section) => sectionObserver.observe(section));
  }

  const counters = document.querySelectorAll('[data-count]');
  const formatCounter = (counter, value) => {
    const decimals = Number(counter.dataset.decimals || 0);
    const formatted = new Intl.NumberFormat('id-ID', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
    return `${formatted}${counter.dataset.suffix || ''}`;
  };

  const showCounterValue = (counter, value) => {
    counter.textContent = formatCounter(counter, value);
  };

  const animateCounter = (counter) => {
    const target = Number(counter.dataset.count);
    const duration = 900;
    const startTime = performance.now();

    const update = (time) => {
      const progress = Math.min((time - startTime) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      showCounterValue(counter, target * easedProgress);
      if (progress < 1) window.requestAnimationFrame(update);
      else showCounterValue(counter, target);
    };

    window.requestAnimationFrame(update);
  };

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion || !('IntersectionObserver' in window)) {
    counters.forEach((counter) => showCounterValue(counter, Number(counter.dataset.count)));
  } else {
    const counterObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.55 });

    counters.forEach((counter) => counterObserver.observe(counter));
  }

});
