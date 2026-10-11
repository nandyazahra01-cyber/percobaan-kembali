document.addEventListener('DOMContentLoaded', () => {
  const showNotice = (notice, message, isError = false) => {
    if (!notice) return;
    notice.textContent = message;
    notice.classList.toggle('is-error', isError);
    notice.hidden = false;
  };

  const roleConfigs = {
    mahasiswa: {
      badge: 'Portal Mahasiswa',
      title: 'Masuk ke Akun KAWIRA',
      desc: 'Lanjutkan perjalanan wirausahamu hari ini.',
      emailLabel: 'Alamat Email Mahasiswa',
      email: 'kawira.anindya@student.ac.id',
      password: 'demo1234',
      buttonText: 'Masuk sebagai Mahasiswa',
      target: 'dashboard.html'
    },
    mentor: {
      badge: 'Portal Mentor Sebaya',
      title: 'Masuk sebagai Mentor',
      desc: 'Kelola jadwal konsultasi, bimbingan mahasiswa, dan review bisnis.',
      emailLabel: 'Alamat Email Mentor',
      email: 'mentor.aditya@kawira.id',
      password: 'mentor1234',
      buttonText: 'Masuk sebagai Mentor',
      target: 'mentor-workspace.html'
    },
    admin: {
      badge: 'Portal Administrator',
      title: 'Masuk sebagai Administrator',
      desc: 'Akses panel pengelola, verifikasi modul & mentor, serta analitik sistem.',
      emailLabel: 'Alamat Email Administrator',
      email: 'admin.kawira@unj.ac.id',
      password: 'admin1234',
      buttonText: 'Masuk sebagai Admin',
      target: 'admin-dashboard.html'
    }
  };

  let activeRole = 'mahasiswa';

  const setRole = (roleKey) => {
    const config = roleConfigs[roleKey];
    if (!config) return;
    activeRole = roleKey;

    // Update active tab buttons
    document.querySelectorAll('[data-role-btn]').forEach((btn) => {
      const isSelected = btn.dataset.roleBtn === roleKey;
      btn.classList.toggle('active', isSelected);
      btn.setAttribute('aria-selected', String(isSelected));
    });

    // Update demo chips
    document.querySelectorAll('[data-fill-role]').forEach((chip) => {
      chip.classList.toggle('active', chip.dataset.fillRole === roleKey);
    });

    // Update role banner text
    const badgeEl = document.getElementById('role-info-badge');
    const descEl = document.getElementById('role-info-desc');
    if (badgeEl) badgeEl.textContent = config.badge;
    if (descEl) descEl.textContent = config.desc;

    // Update titles and labels
    const titleEl = document.getElementById('auth-title');
    if (titleEl) titleEl.textContent = config.title;

    const emailLabel = document.getElementById('email-label');
    if (emailLabel) emailLabel.textContent = config.emailLabel;

    // Update form elements
    const form = document.querySelector('[data-auth-form]');
    if (form) {
      form.dataset.currentRole = roleKey;
      const emailInput = form.elements.email;
      const passInput = form.elements.password;

      // Fill demo credentials if empty or matching another role demo
      const allDemoEmails = Object.values(roleConfigs).map(c => c.email);
      if (emailInput && (!emailInput.value || allDemoEmails.includes(emailInput.value))) {
        emailInput.value = config.email;
      }
      if (passInput && (!passInput.value || passInput.value === 'demo1234' || passInput.value === 'mentor1234' || passInput.value === 'admin1234')) {
        passInput.value = config.password;
      }

      const submitBtn = document.getElementById('auth-submit-btn');
      if (submitBtn) {
        submitBtn.innerHTML = `${config.buttonText} <span aria-hidden="true">→</span>`;
      }
    }
  };

  // Event listeners for role tab buttons
  document.querySelectorAll('[data-role-btn]').forEach((btn) => {
    btn.addEventListener('click', () => {
      setRole(btn.dataset.roleBtn);
    });
  });

  // Event listeners for demo chips
  document.querySelectorAll('[data-fill-role]').forEach((chip) => {
    chip.addEventListener('click', () => {
      setRole(chip.dataset.fillRole);
    });
  });

  // Read URL query parameter ?role=mentor or ?role=admin
  const searchParams = new URLSearchParams(window.location.search);
  const initialRole = searchParams.get('role');
  if (initialRole && roleConfigs[initialRole]) {
    setRole(initialRole);
  }

  // Password visibility toggle
  document.querySelectorAll('[data-password-toggle]').forEach((toggle) => {
    toggle.addEventListener('click', () => {
      const input = document.getElementById(toggle.getAttribute('aria-controls'));
      if (!input) return;
      const isPasswordVisible = input.type === 'text';
      input.type = isPasswordVisible ? 'password' : 'text';
      toggle.textContent = isPasswordVisible ? 'Tampilkan' : 'Sembunyikan';
      toggle.setAttribute('aria-label', isPasswordVisible ? 'Tampilkan kata sandi' : 'Sembunyikan kata sandi');
    });
  });

  // Auth form submissions
  document.querySelectorAll('[data-auth-form]').forEach((form) => {
    const notice = form.querySelector('[data-auth-notice]');
    const password = form.elements.password;
    const confirmation = form.elements['password-confirm'];

    const validatePasswordMatch = () => {
      if (!confirmation) return;
      const mismatch = confirmation.value.length > 0 && confirmation.value !== password.value;
      confirmation.setCustomValidity(mismatch ? 'Konfirmasi kata sandi belum sama.' : '');
      if (mismatch) confirmation.setAttribute('aria-invalid', 'true');
      else confirmation.removeAttribute('aria-invalid');
    };

    password?.addEventListener('input', validatePasswordMatch);
    confirmation?.addEventListener('input', validatePasswordMatch);

    form.addEventListener('input', () => {
      if (notice) {
        notice.hidden = true;
        notice.classList.remove('is-error');
      }
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      validatePasswordMatch();
      if (!form.reportValidity()) return;

      if (form.dataset.authMode === 'login') {
        const role = form.dataset.currentRole || activeRole || 'mahasiswa';
        const normRole = (role === 'mahasiswa' || role === 'mentee') ? 'mentee' : role;
        localStorage.setItem('kawira_token', 'token_' + normRole + '_' + Date.now());

        if (normRole === 'mentor') {
          localStorage.setItem('kawira_user', JSON.stringify({
            id: 2,
            name: 'Aditya Ramadhan',
            email: form.elements.email?.value || 'mentor.aditya@kawira.id',
            role: 'mentor',
            title: 'Mentor Kuliner & Startup'
          }));
        } else if (normRole === 'admin') {
          localStorage.setItem('kawira_user', JSON.stringify({
            id: 8,
            name: 'Nadya Sabrina Az-Zahra',
            email: form.elements.email?.value || 'admin.kawira@unj.ac.id',
            role: 'admin',
            title: 'Super Administrator (Tim MBG)'
          }));
        } else {
          localStorage.setItem('kawira_user', JSON.stringify({
            id: 1,
            name: 'Kawira Anindya',
            email: form.elements.email?.value || 'kawira.anindya@student.ac.id',
            role: 'mentee',
            businessName: 'Dapur Nusantara'
          }));
        }

        const targetUrl = roleConfigs[role]?.target || 'dashboard.html';
        window.location.href = targetUrl;
        return;
      }

      const message = form.dataset.authMode === 'register'
        ? 'Data pendaftaran berhasil divalidasi. Akun siap dihubungkan ke sistem.'
        : 'Data masuk valid. Mengalihkan ke dasbor...';
      showNotice(notice, message);
    });
  });

  // Google sign in simulation
  document.querySelectorAll('[data-google-signin]').forEach((button) => {
    button.addEventListener('click', () => {
      if (document.querySelector('[data-auth-mode="login"]')) {
        const form = document.querySelector('[data-auth-form]');
        const role = form?.dataset?.currentRole || activeRole || 'mahasiswa';
        window.location.href = roleConfigs[role]?.target || 'dashboard.html';
        return;
      }

      const notice = document.querySelector('[data-auth-notice]');
      showNotice(notice, 'Google Sign-In memerlukan konfigurasi OAuth.', true);
    });
  });
});
