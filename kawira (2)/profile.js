document.addEventListener('DOMContentLoaded', () => {
  const photoInput = document.querySelector('[data-profile-photo-input]');
  const photoPreview = document.querySelector('[data-profile-photo-preview]');
  const profileForm = document.querySelector('[data-profile-form]');
  const notice = document.querySelector('[data-profile-notice]');

  photoInput?.addEventListener('change', () => {
    const [file] = photoInput.files || [];
    if (!file) return;
    photoPreview.src = URL.createObjectURL(file);
  });

  profileForm?.addEventListener('input', () => {
    notice.hidden = true;
  });

  profileForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!profileForm.reportValidity()) return;
    notice.textContent = 'Perubahan profil berhasil disimpan.';
    notice.hidden = false;
  });
});
