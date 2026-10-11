/**
 * KAWIRA - Role Guard & Navigation Isolation Engine
 * Enforces strict Role-Based Access Control (RBAC) and renders isolated sidebars
 * for Mentee (UMKM), Mentor (Pembimbing), and Admin (Super Admin).
 */

(function () {
  function initRoleGuard() {
    const token = localStorage.getItem('kawira_token');
    const userStr = localStorage.getItem('kawira_user');
    let user = {};

    try {
      user = JSON.parse(userStr || '{}');
    } catch (e) {
      user = {};
    }

    const currentPath = window.location.pathname.toLowerCase();
    const isPublicPage = [
      'index.html',
      'login.html',
      'login-staff.html',
      'register.html',
      'tim-kami.html',
      '/',
      ''
    ].some(p => currentPath === p || currentPath.endsWith('/' + p) || currentPath.endsWith(p));

    // 1. Unauthenticated Guard
    if (!token && !isPublicPage) {
      window.location.href = 'login.html';
      return;
    }

    // Default role if token exists but role unset (fallback to mentee)
    const role = user.role || (token ? 'mentee' : null);

    // 2. Strict Role Guard
    if (role === 'mentor') {
      // Mentor is strictly forbidden from accessing Mentee and Admin specific pages
      const forbiddenForMentor = [
        'pembukuan.html',
        'modul.html',
        'komunitas.html',
        'admin-dashboard.html',
        'dashboard.html',
        'detail-modul-1.html',
        'detail-modul-2.html'
      ];
      if (forbiddenForMentor.some(p => currentPath.endsWith(p) || currentPath.includes('/' + p))) {
        window.location.href = 'mentor-workspace.html';
        return;
      }
    } else if (role === 'mentee') {
      // Mentee is strictly forbidden from accessing Mentor workspace and Admin dashboard
      const forbiddenForMentee = [
        'mentor-workspace.html',
        'admin-dashboard.html',
        'login-staff.html'
      ];
      if (forbiddenForMentee.some(p => currentPath.endsWith(p) || currentPath.includes('/' + p))) {
        window.location.href = 'dashboard.html';
        return;
      }
    } else if (role === 'admin') {
      // Admin is strictly forbidden from accessing mentee transaction/module portals or mentor workspace
      const forbiddenForAdmin = [
        'mentor-workspace.html',
        'pembukuan.html',
        'modul.html',
        'komunitas.html',
        'dashboard.html',
        'detail-modul-1.html',
        'detail-modul-2.html'
      ];
      if (forbiddenForAdmin.some(p => currentPath.endsWith(p) || currentPath.includes('/' + p))) {
        window.location.href = 'admin-dashboard.html';
        return;
      }
    }

    // 3. Dynamic Isolated Sidebar Navigation Rendering
    renderIsolatedNavigation(role, currentPath);
    updateSidebarUserProfile(role, user);
  }

  function renderIsolatedNavigation(role, currentPath) {
    const navContainer = document.getElementById('dashboard-navigation');
    if (!navContainer || !role) return;

    if (role === 'mentor') {
      navContainer.innerHTML = `
        <a class="dashboard-nav-link ${currentPath.includes('mentor-workspace.html') ? 'is-active' : ''}" href="mentor-workspace.html" aria-current="${currentPath.includes('mentor-workspace.html') ? 'page' : 'false'}">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></svg>
          <span>Workspace Mentee</span>
        </a>
        <a class="dashboard-nav-link ${currentPath.includes('chat-mentor.html') ? 'is-active' : ''}" href="chat-mentor.html" aria-current="${currentPath.includes('chat-mentor.html') ? 'page' : 'false'}">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <span>Live Chat Mentee</span>
        </a>
        <a class="dashboard-nav-link" href="mentor-workspace.html#panel-eval">
          <img class="sidebar-nav-icon" src="assets/BookIcon.svg" alt="" style="width:18px; height:18px;" />
          <span>Catatan &amp; Evaluasi</span>
        </a>
        <a class="dashboard-nav-link ${currentPath.includes('profile.html') ? 'is-active' : ''}" href="profile.html" aria-current="${currentPath.includes('profile.html') ? 'page' : 'false'}">
          <img class="sidebar-nav-icon" src="assets/SettingsIcon.svg" alt="" style="width:18px; height:18px;" />
          <span>Profil &amp; Pengaturan</span>
        </a>
        <a class="dashboard-signout" href="login-staff.html" onclick="logoutKawira()">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 4H5v16h5M14 8l4 4-4 4M8 12h10"/></svg>
          <span>Keluar dari Akun</span>
        </a>
      `;
    } else if (role === 'admin') {
      navContainer.innerHTML = `
        <a class="dashboard-nav-link ${currentPath.includes('admin-dashboard.html') ? 'is-active' : ''}" href="admin-dashboard.html" aria-current="${currentPath.includes('admin-dashboard.html') ? 'page' : 'false'}">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></svg>
          <span>Super Admin Overview</span>
        </a>
        <a class="dashboard-nav-link" href="admin-dashboard.html#section-users-table">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="8" r="3.5"/><path d="M2.8 19c.4-3.1 2.7-5 6.2-5s5.8 1.9 6.2 5"/><path d="M16 5.2a3.5 3.5 0 0 1 0 6.6M17.2 14c2.4.5 3.7 2.2 4 4.5"/></svg>
          <span>Master Data Users</span>
        </a>
        <a class="dashboard-nav-link" href="admin-dashboard.html#section-audit-logs">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="10"/></svg>
          <span>Activity Tracker Live</span>
        </a>
        <a class="dashboard-nav-link" href="admin-dashboard.html#section-stats-overview">
          <img class="sidebar-nav-icon" src="assets/BookIcon.svg" alt="" style="width:18px; height:18px;" />
          <span>Monitoring Database</span>
        </a>
        <a class="dashboard-nav-link ${currentPath.includes('profile.html') ? 'is-active' : ''}" href="profile.html">
          <img class="sidebar-nav-icon" src="assets/SettingsIcon.svg" alt="" style="width:18px; height:18px;" />
          <span>Profil Pengelola</span>
        </a>
        <a class="dashboard-signout" href="login-staff.html" onclick="logoutKawira()">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 4H5v16h5M14 8l4 4-4 4M8 12h10"/></svg>
          <span>Keluar dari Akun</span>
        </a>
      `;
    } else {
      // Mentee (Wirausaha / UMKM) - Strict Isolated Navigation
      navContainer.innerHTML = `
        <a class="dashboard-nav-link ${currentPath.includes('dashboard.html') ? 'is-active' : ''}" href="dashboard.html" aria-current="${currentPath.includes('dashboard.html') ? 'page' : 'false'}">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></svg>
          <span>Dashboard Utama</span>
        </a>
        <a class="dashboard-nav-link ${currentPath.includes('mentoring.html') || currentPath.includes('chat-mentor.html') ? 'is-active' : ''}" href="mentoring.html" aria-current="${currentPath.includes('mentoring.html') ? 'page' : 'false'}">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="8" r="3.5"/><path d="M2.8 19c.4-3.1 2.7-5 6.2-5s5.8 1.9 6.2 5"/><path d="M16 5.2a3.5 3.5 0 0 1 0 6.6M17.2 14c2.4.5 3.7 2.2 4 4.5"/></svg>
          <span>Mentoring &amp; Katalog</span>
        </a>
        <a class="dashboard-nav-link ${currentPath.includes('pembukuan.html') ? 'is-active' : ''}" href="pembukuan.html" aria-current="${currentPath.includes('pembukuan.html') ? 'page' : 'false'}">
          <img class="sidebar-nav-icon" src="assets/BookIcon.svg" alt="" style="width:18px; height:18px;" />
          <span>Pembukuan &amp; Arus Kas</span>
        </a>
        <a class="dashboard-nav-link ${currentPath.includes('modul.html') || currentPath.includes('detail-modul') ? 'is-active' : ''}" href="modul.html" aria-current="${currentPath.includes('modul.html') ? 'page' : 'false'}">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/></svg>
          <span>Modul &amp; Template</span>
        </a>
        <a class="dashboard-nav-link ${currentPath.includes('komunitas.html') ? 'is-active' : ''}" href="komunitas.html" aria-current="${currentPath.includes('komunitas.html') ? 'page' : 'false'}">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 5.5h16v11H9l-5 3v-14Z"/><path d="M8 9h8M8 12.5h5"/></svg>
          <span>Komunitas &amp; Diskusi</span>
        </a>
        <a class="dashboard-nav-link ${currentPath.includes('profile.html') ? 'is-active' : ''}" href="profile.html" aria-current="${currentPath.includes('profile.html') ? 'page' : 'false'}">
          <img class="sidebar-nav-icon" src="assets/SettingsIcon.svg" alt="" style="width:18px; height:18px;" />
          <span>Profil &amp; Pengaturan</span>
        </a>
        <a class="dashboard-signout" href="login.html" onclick="logoutKawira()">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 4H5v16h5M14 8l4 4-4 4M8 12h10"/></svg>
          <span>Keluar dari Akun</span>
        </a>
      `;
    }
  }

  function updateSidebarUserProfile(role, user) {
    const userCard = document.querySelector('.sidebar-user-card, #account-profile');
    if (!userCard) return;

    const avatarImg = userCard.querySelector('.dashboard-user-avatar');
    const copyWrap = userCard.querySelector('.dashboard-user-copy');

    if (role === 'mentor') {
      if (avatarImg) avatarImg.src = 'assets/Image%20(Speaker).png';
      if (copyWrap) {
        copyWrap.innerHTML = `<strong>${user.name || 'Aditya Ramadhan'}</strong><small>${user.title || 'Mentor Kuliner & Startup'}</small>`;
      }
    } else if (role === 'admin') {
      if (avatarImg) avatarImg.src = 'assets/Nadya.png';
      if (copyWrap) {
        copyWrap.innerHTML = `<strong>${user.name || 'Nadya Sabrina Az-Zahra'}</strong><small>Super Administrator (Tim MBG)</small>`;
      }
    } else {
      // Mentee
      if (avatarImg) avatarImg.src = 'assets/fotoProfil.jpg';
      if (copyWrap) {
        copyWrap.innerHTML = `<strong>${user.name || 'Kawira Anindya'}</strong><small>${user.businessName || 'Dapur Nusantara'}</small>`;
      }
    }
  }

  window.logoutKawira = function () {
    localStorage.removeItem('kawira_token');
    localStorage.removeItem('kawira_user');
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRoleGuard);
  } else {
    initRoleGuard();
  }
})();
