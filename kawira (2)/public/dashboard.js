document.addEventListener('DOMContentLoaded', () => {
  const toast = document.querySelector('[data-dashboard-toast]');
  let toastTimeout;

  const showToast = (message) => {
    toast.textContent = message;
    toast.hidden = false;
    window.clearTimeout(toastTimeout);
    toastTimeout = window.setTimeout(() => {
      toast.hidden = true;
    }, 3200);
  };

  document.querySelector('.notification-button')?.addEventListener('click', (event) => {
    const button = event.currentTarget;
    const isRead = button.getAttribute('aria-pressed') === 'true';
    button.setAttribute('aria-pressed', String(!isRead));
    button.setAttribute('aria-label', isRead ? 'Notifikasi, 2 baru' : 'Notifikasi sudah dibaca');
    button.querySelector('span').hidden = !isRead;
    showToast(isRead ? 'Ada 2 notifikasi yang belum dibaca.' : 'Notifikasi ditandai sudah dibaca.');
  });

  document.querySelectorAll('.mentor-booking').forEach((button) => {
    button.addEventListener('click', () => {
      const mentorName = button.closest('.mentor-card').querySelector('.mentor-identity h3').textContent;
      showToast(`Permintaan sesi dengan ${mentorName} siap dijadwalkan.`);
    });
  });
});
