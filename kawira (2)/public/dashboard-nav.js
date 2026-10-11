document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.querySelector('.dashboard-sidebar');
  const menuButton = document.querySelector('.dashboard-menu-button');
  const closeButton = document.querySelector('.dashboard-drawer-close');
  const backdrop = document.querySelector('.dashboard-backdrop');

  if (!sidebar || !menuButton || !closeButton || !backdrop) return;

  const setDrawerOpen = (isOpen, restoreFocus = false) => {
    document.body.classList.toggle('dashboard-menu-open', isOpen);
    menuButton.setAttribute('aria-expanded', String(isOpen));
    backdrop.hidden = !isOpen;

    if (isOpen) closeButton.focus({ preventScroll: true });
    else if (restoreFocus) menuButton.focus({ preventScroll: true });
  };

  menuButton.addEventListener('click', () => {
    setDrawerOpen(menuButton.getAttribute('aria-expanded') !== 'true');
  });
  closeButton.addEventListener('click', () => setDrawerOpen(false, true));
  backdrop.addEventListener('click', () => setDrawerOpen(false, true));
  sidebar.querySelectorAll('.dashboard-nav-link, .dashboard-signout').forEach((link) => {
    link.addEventListener('click', () => setDrawerOpen(false));
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && document.body.classList.contains('dashboard-menu-open')) {
      setDrawerOpen(false, true);
    }
  });
  window.matchMedia('(min-width: 861px)').addEventListener('change', (event) => {
    if (event.matches) setDrawerOpen(false);
  });

  const filename = window.location.pathname.split('/').pop().toLowerCase();
  const activePage = {
    'chat-mentor.html': 'mentoring.html',
    'detail-modul-1.html': 'modul.html',
    'detail-modul-2.html': 'modul.html',
    'riwayat-invoice.html': 'mentoring.html',
  }[filename] || filename || 'dashboard.html';
  const navLinks = sidebar.querySelectorAll('.dashboard-nav-link');
  navLinks.forEach((link) => {
    const isActive = link.getAttribute('href').split('?')[0] === activePage;
    link.classList.toggle('is-active', isActive);
    if (isActive) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
});
