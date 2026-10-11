/**
 * Script for Mentor Workspace
 * Manages mentee monitoring, real-time live chat with simulated replies, and evaluation note submission.
 */

let menteesData = [];
let activeMenteeId = 1;
let currentTab = 'mentees';

document.addEventListener('DOMContentLoaded', () => {
  // Set default date to today
  const dateInput = document.getElementById('eval-date');
  if (dateInput) {
    dateInput.value = new Date().toISOString().split('T')[0];
  }

  // Load initial mentees
  fetchMentees();

  // Load initial evaluations
  fetchEvaluations();

  // Toggle availability status
  const availBtn = document.getElementById('ws-availability-btn');
  if (availBtn) {
    availBtn.addEventListener('click', () => {
      const textEl = document.getElementById('ws-status-text');
      const isReady = textEl.textContent.includes('Siap');
      if (isReady) {
        textEl.textContent = 'Istirahat';
        availBtn.style.background = '#fef2f2';
        availBtn.style.borderColor = '#fecaca';
        availBtn.style.color = '#dc2626';
        availBtn.querySelector('.dot').style.background = '#dc2626';
        showToast('Status diubah: Sedang istirahat, tidak menerima permintaan baru.');
      } else {
        textEl.textContent = 'Siap Mentoring';
        availBtn.style.background = '#eefdf3';
        availBtn.style.borderColor = '#bbf7d0';
        availBtn.style.color = '#15803d';
        availBtn.querySelector('.dot').style.background = '#22c55e';
        showToast('Status diubah: Siap menerima sesi mentoring live!');
      }
    });
  }
});

// Toast notification helper
function showToast(message) {
  const toast = document.querySelector('[data-dashboard-toast]');
  if (!toast) return;
  toast.textContent = message;
  toast.hidden = false;
  setTimeout(() => { toast.hidden = true; }, 3200);
}

// Tab switcher
function switchTab(tabKey) {
  currentTab = tabKey;
  const panels = {
    mentees: document.getElementById('panel-mentees'),
    chat: document.getElementById('panel-chat'),
    eval: document.getElementById('panel-eval')
  };

  const tabs = {
    mentees: document.getElementById('tab-btn-mentees'),
    chat: document.getElementById('tab-btn-chat'),
    eval: document.getElementById('tab-btn-eval')
  };

  Object.keys(panels).forEach(k => {
    if (panels[k]) panels[k].style.display = k === tabKey ? 'block' : 'none';
    if (tabs[k]) {
      tabs[k].classList.toggle('active', k === tabKey);
      tabs[k].setAttribute('aria-selected', String(k === tabKey));
    }
  });

  if (tabKey === 'chat') {
    loadChat(activeMenteeId);
  }
}

// Fetch mentees list
async function fetchMentees() {
  try {
    const res = await fetch('/api/mentor/mentees');
    if (!res.ok) throw new Error('Network error');
    const json = await res.json();
    menteesData = json.data || [];
  } catch (e) {
    // Fallback data
    menteesData = [
      { id: 1, name: 'Kawira Anindya', businessName: 'Dapur Nusantara', category: 'Kuliner & F&B', status: 'Aktif', online: true, university: 'FEB UNJ 2024', topic: 'Validasi HPP & Strategi Pre-Order', scheduledTime: 'Hari ini, 15:30 WIB', avatar: 'assets/fotoProfil.jpg' },
      { id: 2, name: 'Fikri Ramadhan', businessName: 'EcoCraft Studio', category: 'Kriya Ramah Lingkungan', status: 'Aktif', online: true, university: 'ITB 2023', topic: 'Penyempurnaan BMC & Analisis Pasar B2B', scheduledTime: 'Besok, 13:00 WIB', avatar: 'assets/Nasywa.png' },
      { id: 3, name: 'Siti Nurhaliza', businessName: 'ModisHijab Co.', category: 'Fashion & E-Commerce', status: 'Aktif', online: false, university: 'UGM 2024', topic: 'Optimalisasi TikTok Shop Ads', scheduledTime: '14 Okt 2026, 16:00 WIB', avatar: 'assets/Ayunda.png' },
      { id: 4, name: 'Budi Prasetyo', businessName: 'WarungDigital POS', category: 'Teknologi & SaaS', status: 'Aktif', online: false, university: 'UNJ 2023', topic: 'Review Prototype UI & Pitch Deck', scheduledTime: '16 Okt 2026, 10:00 WIB', avatar: 'assets/Image%20(Budi%20Santoso).png' },
      { id: 5, name: 'Dewi Anggraini', businessName: 'Sambal Bu Dewi', category: 'Kuliner Tradisional', status: 'Selesai', online: false, university: 'UI 2023', topic: 'Sertifikasi Halal & Kemasan', scheduledTime: 'Selesai (3 Sesi Penuh)', avatar: 'assets/Novy.jpeg' }
    ];
  }

  renderMentees(menteesData);
  renderChatMenteeList();
  populateMenteeDropdown();
  const countBadge = document.getElementById('mentee-count-badge');
  if (countBadge) countBadge.textContent = menteesData.length;
}

// Render Mentee Monitoring Cards
function renderMentees(list) {
  const container = document.getElementById('mentees-grid');
  if (!container) return;

  if (list.length === 0) {
    container.innerHTML = '<div style="grid-column:1/-1; padding:30px; text-align:center; color:#79728b;">Tidak ada mentee yang cocok dengan filter.</div>';
    return;
  }

  container.innerHTML = list.map(m => `
    <div class="stat-card-item" style="gap:12px; transition:transform 0.2s; border:1px solid #eae6f4;">
      <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:10px;">
        <div style="display:flex; align-items:center; gap:12px;">
          <div style="position:relative;">
            <img src="${m.avatar || 'assets/fotoProfil.jpg'}" alt="${m.name}" style="width:48px; height:48px; border-radius:50%; object-fit:cover;" />
            <span style="position:absolute; bottom:0; right:0; width:12px; height:12px; border-radius:50%; border:2px solid #fff; background:${m.online ? '#22c55e' : '#cbd5e1'};"></span>
          </div>
          <div>
            <h3 style="margin:0; font-size:0.95rem; font-weight:700; color:var(--ink);">${m.name}</h3>
            <span style="font-size:0.75rem; color:#79728b;">${m.university || 'Mahasiswa Wirausaha'}</span>
          </div>
        </div>
        <span class="badge-tag ${m.status === 'Aktif' ? 'green' : 'purple'}">${m.status}</span>
      </div>

      <div style="background:#f9f8fe; border-radius:10px; padding:10px 12px; border:1px solid #eeeaf8;">
        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
          <strong style="font-size:0.85rem; color:#5937dd;">${m.businessName}</strong>
          <span style="font-size:0.7rem; background:#ece7fb; color:#5937dd; padding:2px 8px; border-radius:12px; font-weight:600;">${m.category}</span>
        </div>
        <div style="font-size:0.76rem; color:#605874; margin-top:6px;">
          <strong>Fokus:</strong> ${m.topic || 'Konsultasi Perencanaan Bisnis'}
        </div>
        <div style="font-size:0.72rem; color:#857d99; margin-top:3px;">
          🕒 <strong>Jadwal:</strong> ${m.scheduledTime || 'Jadwal fleksibel'}
        </div>
      </div>

      <div style="display:flex; gap:8px; margin-top:4px;">
        <button type="button" class="btn-sm-action" style="flex:1; justify-content:center;" onclick="openChatWithMentee(${m.id})">
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <span>Chat Live</span>
        </button>
        <button type="button" class="btn-sm-ghost" style="flex:1; justify-content:center;" onclick="openEvalForMentee(${m.id})">
          <span>+ Catatan</span>
        </button>
      </div>
    </div>
  `).join('');
}

// Filter mentees search
function filterMentees() {
  const q = document.getElementById('mentee-search-input')?.value.toLowerCase() || '';
  const status = document.getElementById('mentee-status-filter')?.value || 'all';

  const filtered = menteesData.filter(m => {
    const matchQ = m.name.toLowerCase().includes(q) || m.businessName.toLowerCase().includes(q) || m.category.toLowerCase().includes(q);
    const matchStatus = status === 'all' || m.status === status;
    return matchQ && matchStatus;
  });

  renderMentees(filtered);
}

// Render Mentee List in Chat Sidebar
function renderChatMenteeList() {
  const container = document.getElementById('chat-mentee-list');
  if (!container) return;

  container.innerHTML = menteesData.map(m => `
    <div onclick="loadChat(${m.id})" style="padding:12px 16px; border-bottom:1px solid #f0ecf8; cursor:pointer; display:flex; align-items:center; gap:10px; background:${m.id === activeMenteeId ? '#ede8fb' : 'transparent'}; transition:background 0.15s;">
      <div style="position:relative;">
        <img src="${m.avatar || 'assets/fotoProfil.jpg'}" alt="" style="width:38px; height:38px; border-radius:50%; object-fit:cover;" />
        <span style="position:absolute; bottom:0; right:0; width:10px; height:10px; border-radius:50%; border:2px solid #fff; background:${m.online ? '#22c55e' : '#cbd5e1'};"></span>
      </div>
      <div style="flex:1; overflow:hidden;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <strong style="font-size:0.83rem; color:var(--ink);">${m.name}</strong>
          <small style="font-size:0.68rem; color:${m.online ? '#16a34a' : '#8c869e'};">${m.online ? 'Online' : 'Offline'}</small>
        </div>
        <p style="margin:2px 0 0; font-size:0.74rem; color:#704cf5; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${m.businessName}</p>
      </div>
    </div>
  `).join('');
}

// Populate Dropdown in Evaluation Form
function populateMenteeDropdown() {
  const select = document.getElementById('eval-mentee-select');
  if (!select) return;

  select.innerHTML = menteesData.map(m => `
    <option value="${m.id}" ${m.id === activeMenteeId ? 'selected' : ''}>
      ${m.name} (${m.businessName} - ${m.category})
    </option>
  `).join('');
}

// Open chat tab directly for a mentee
function openChatWithMentee(menteeId) {
  activeMenteeId = menteeId;
  switchTab('chat');
}

// Open evaluation tab directly for a mentee
function openEvalForMentee(menteeId) {
  activeMenteeId = menteeId;
  const select = document.getElementById('eval-mentee-select');
  if (select) select.value = menteeId;
  switchTab('eval');
}

function quickFillNoteForActiveMentee() {
  openEvalForMentee(activeMenteeId);
}

// Load Chat Conversation
async function loadChat(menteeId) {
  activeMenteeId = menteeId;
  renderChatMenteeList();

  const mentee = menteesData.find(m => m.id === Number(menteeId));
  if (mentee) {
    document.getElementById('chat-header-name').textContent = mentee.name;
    document.getElementById('chat-header-business').textContent = `${mentee.businessName} · ${mentee.category}`;
    document.getElementById('chat-header-avatar').src = mentee.avatar || 'assets/fotoProfil.jpg';
    const statusDot = document.getElementById('chat-header-status-dot');
    if (statusDot) {
      statusDot.innerHTML = `<span class="dot" style="background:${mentee.online ? '#22c55e' : '#cbd5e1'}"></span> ${mentee.online ? 'Online' : 'Offline'}`;
    }
  }

  const container = document.getElementById('chat-messages-container');
  if (!container) return;
  container.innerHTML = '<div style="text-align:center; padding:20px; color:#79728b;">Memuat percakapan...</div>';

  try {
    const res = await fetch(`/api/mentor/chat/${menteeId}`);
    if (!res.ok) throw new Error();
    const json = await res.json();
    renderChatMessages(json.messages || []);
  } catch (e) {
    // Fallback sample chat
    const sampleMsgs = [
      { id: 1, sender: 'mentee', senderName: mentee?.name || 'Mentee', text: 'Halo Kak Aditya! Selamat sore, terima kasih sudah menerima jadwal bimbingan kami.', timestamp: '14:20' },
      { id: 2, sender: 'mentor', senderName: 'Aditya Ramadhan', text: 'Sore! Sama-sama. Bagaimana kabar bisnisnya? Ada progres apa dari catatan sesi kemarin?', timestamp: '14:22' },
      { id: 3, sender: 'mentee', senderName: mentee?.name || 'Mentee', text: 'Sudah kami hitung ulang margin laba kotor setelah kemasan, ada di 42%. Tapi kami ragu di harga bundling promo.', timestamp: '14:25' }
    ];
    renderChatMessages(sampleMsgs);
  }
}

// Render Chat Messages
function renderChatMessages(messages) {
  const container = document.getElementById('chat-messages-container');
  if (!container) return;

  if (messages.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:40px 20px; color:#79728b;">
        <p style="margin:0 0 6px;">Belum ada pesan percakapan dengan mentee ini.</p>
        <small>Ketik pesan pertama di bawah untuk membuka sesi konsultasi.</small>
      </div>
    `;
    return;
  }

  container.innerHTML = messages.map(msg => {
    const isMentor = msg.sender === 'mentor';
    return `
      <div style="display:flex; flex-direction:column; align-items:${isMentor ? 'flex-end' : 'flex-start'};">
        <span style="font-size:0.68rem; color:#857f98; margin-bottom:3px; padding:0 4px;">${msg.senderName} · ${msg.timestamp}</span>
        <div style="max-width:75%; padding:11px 15px; border-radius:${isMentor ? '14px 14px 3px 14px' : '14px 14px 14px 3px'}; background:${isMentor ? 'var(--purple)' : '#ffffff'}; color:${isMentor ? '#ffffff' : 'var(--ink)'}; box-shadow:0 2px 8px rgba(0,0,0,0.05); font-size:0.85rem; line-height:1.45; border:${isMentor ? 'none' : '1px solid #ebe7f6'};">
          ${msg.text}
        </div>
      </div>
    `;
  }).join('');

  container.scrollTop = container.scrollHeight;
}

// Send quick reply
function sendQuickReply(text) {
  const input = document.getElementById('chat-message-input');
  if (input) {
    input.value = text;
    handleSendMessage(new Event('submit'));
  }
}

// Handle sending message
async function handleSendMessage(e) {
  if (e && e.preventDefault) e.preventDefault();
  const input = document.getElementById('chat-message-input');
  if (!input || !input.value.trim()) return;

  const text = input.value.trim();
  input.value = '';

  const container = document.getElementById('chat-messages-container');
  const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  // Append mentor message locally
  const tempMsg = document.createElement('div');
  tempMsg.style.cssText = 'display:flex; flex-direction:column; align-items:flex-end;';
  tempMsg.innerHTML = `
    <span style="font-size:0.68rem; color:#857f98; margin-bottom:3px; padding:0 4px;">Aditya Ramadhan · ${now}</span>
    <div style="max-width:75%; padding:11px 15px; border-radius:14px 14px 3px 14px; background:var(--purple); color:#ffffff; font-size:0.85rem; line-height:1.45;">
      ${text}
    </div>
  `;
  container.appendChild(tempMsg);
  container.scrollTop = container.scrollHeight;

  // Post to backend API
  try {
    await fetch(`/api/mentor/chat/${activeMenteeId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, senderName: 'Aditya Ramadhan' })
    });
  } catch (err) {
    console.warn('Saved offline in session');
  }

  // Simulate realistic Mentee auto-reply after 1.5 seconds if mentee is online
  const mentee = menteesData.find(m => m.id === activeMenteeId);
  if (mentee && mentee.online) {
    setTimeout(() => {
      const replyTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      const menteeReplies = [
        `Siap Kak Aditya! Catatan dari Kakak sangat mencerahkan untuk strategi bisnis kami.`,
        `Baik Kak, nanti saya hitung ulang dan kirimkan buktinya lewat form pembukuan Kawira ya.`,
        `Terima kasih sarannya Kak! Nanti sore kami presentasikan ke tim internal kami.`,
        `Boleh banget Kak, nanti di room meet kita bedah langsung draft pitch deck-nya.`
      ];
      const replyText = menteeReplies[Math.floor(Math.random() * menteeReplies.length)];

      const replyEl = document.createElement('div');
      replyEl.style.cssText = 'display:flex; flex-direction:column; align-items:flex-start;';
      replyEl.innerHTML = `
        <span style="font-size:0.68rem; color:#857f98; margin-bottom:3px; padding:0 4px;">${mentee.name} · ${replyTime}</span>
        <div style="max-width:75%; padding:11px 15px; border-radius:14px 14px 14px 3px; background:#ffffff; color:var(--ink); font-size:0.85rem; line-height:1.45; border:1px solid #ebe7f6; box-shadow:0 2px 8px rgba(0,0,0,0.05);">
          ${replyText}
        </div>
      `;
      container.appendChild(replyEl);
      container.scrollTop = container.scrollHeight;
      showToast(`Pesan baru diterima dari ${mentee.name}!`);
    }, 1400);
  }
}

// Fetch Evaluation History
async function fetchEvaluations() {
  const container = document.getElementById('eval-history-list');
  if (!container) return;

  try {
    const res = await fetch('/api/mentor/notes/all');
    if (!res.ok) throw new Error();
    const json = await res.json();
    renderEvaluations(json.data || []);
  } catch (e) {
    // Fallback sample evaluations
    const sampleNotes = [
      {
        id: 1,
        menteeName: 'Kawira Anindya (Dapur Nusantara)',
        sessionDate: '2026-10-08',
        focusArea: 'Riset Pasar & Validasi Target Konsumen',
        progressSummary: 'Kawira telah menguji 30 sampel makanan beku ke konsumen mahasiswa. 92% menyukai rasa dan packaging.',
        recommendations: 'Buat bundling 3 pack untuk menaikkan Average Order Value (AOV). Catat arus kas rapi di menu Pembukuan.',
        nextStep: 'Hitung HPP bahan baku per gram & uji coba preorder via WhatsApp.',
        status: 'Perlu Sesi Lanjutan',
        rating: 5
      },
      {
        id: 2,
        menteeName: 'Fikri Ramadhan (EcoCraft Studio)',
        sessionDate: '2026-10-09',
        focusArea: 'Business Model Canvas (Key Partners & Cost Structure)',
        progressSummary: 'Fikri mengamankan pasokan limbah kayu daur ulang dari pengrajin lokal dengan harga lebih efisien.',
        recommendations: 'Prioritaskan pesanan souvenir wisuda kampus terlebih dahulu sebelum masuk ke tender korporat besar.',
        nextStep: 'Siapkan foto portofolio produk berkualitas tinggi.',
        status: 'Perlu Sesi Lanjutan',
        rating: 4
      }
    ];
    renderEvaluations(sampleNotes);
  }
}

function renderEvaluations(notes) {
  const container = document.getElementById('eval-history-list');
  const countBadge = document.getElementById('eval-count-badge');
  if (countBadge) countBadge.textContent = `${notes.length} Catatan`;
  if (!container) return;

  if (notes.length === 0) {
    container.innerHTML = '<div style="padding:20px; text-align:center; color:#79728b;">Belum ada riwayat catatan evaluasi yang diinput.</div>';
    return;
  }

  container.innerHTML = notes.map(n => `
    <div style="background:#ffffff; border:1px solid #ebe7f6; border-radius:12px; padding:16px; display:flex; flex-direction:column; gap:8px;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start;">
        <div>
          <strong style="font-size:0.92rem; color:var(--ink);">${n.menteeName || ('Mentee #' + n.menteeId)}</strong>
          <div style="font-size:0.75rem; color:#79728b;">Tanggal: ${n.sessionDate} · Status: <span style="color:#704cf5; font-weight:600;">${n.status}</span></div>
        </div>
        <span style="font-size:0.8rem;">${'⭐'.repeat(n.rating || 5)}</span>
      </div>

      <div style="background:#fcfbfe; border-left:3px solid var(--purple); padding:8px 12px; border-radius:4px;">
        <span style="font-size:0.75rem; font-weight:700; color:#5937dd;">Fokus Bahasan: ${n.focusArea}</span>
        <p style="margin:4px 0 0; font-size:0.82rem; color:#4a4459;">${n.progressSummary}</p>
      </div>

      ${n.recommendations && n.recommendations !== '-' ? `
        <div style="font-size:0.78rem; color:#605973;">
          <strong>Rekomendasi:</strong> ${n.recommendations}
        </div>
      ` : ''}

      ${n.nextStep && n.nextStep !== '-' ? `
        <div style="font-size:0.74rem; background:#f0edff; color:#5937dd; padding:6px 10px; border-radius:6px; font-weight:600;">
          🎯 Target / PR: ${n.nextStep}
        </div>
      ` : ''}
    </div>
  `).join('');
}

// Handle Form Submission for Evaluations
async function handleSaveEvaluation(e) {
  e.preventDefault();
  const menteeId = document.getElementById('eval-mentee-select')?.value;
  const sessionDate = document.getElementById('eval-date')?.value;
  const rating = document.getElementById('eval-rating')?.value;
  const focusArea = document.getElementById('eval-focus')?.value;
  const progressSummary = document.getElementById('eval-summary')?.value;
  const recommendations = document.getElementById('eval-recommendations')?.value;
  const nextStep = document.getElementById('eval-next-step')?.value;
  const status = document.getElementById('eval-status')?.value;

  const mentee = menteesData.find(m => m.id === Number(menteeId));
  const newNote = {
    menteeId,
    menteeName: mentee ? `${mentee.name} (${mentee.businessName})` : `Mentee #${menteeId}`,
    sessionDate,
    rating: Number(rating),
    focusArea,
    progressSummary,
    recommendations,
    nextStep,
    status
  };

  try {
    await fetch('/api/mentor/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newNote)
    });
  } catch (err) {
    console.warn('Saved offline in session');
  }

  showToast(`Catatan evaluasi untuk ${mentee ? mentee.name : 'Mentee'} berhasil disimpan dan diterbitkan!`);

  // Prepend to UI list
  const container = document.getElementById('eval-history-list');
  if (container) {
    const card = document.createElement('div');
    card.style.cssText = 'background:#ffffff; border:1px solid #ebe7f6; border-radius:12px; padding:16px; display:flex; flex-direction:column; gap:8px; animation:fadeIn 0.3s ease;';
    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:flex-start;">
        <div>
          <strong style="font-size:0.92rem; color:var(--ink);">${newNote.menteeName}</strong>
          <div style="font-size:0.75rem; color:#79728b;">Tanggal: ${newNote.sessionDate} · Status: <span style="color:#704cf5; font-weight:600;">${newNote.status}</span></div>
        </div>
        <span style="font-size:0.8rem;">${'⭐'.repeat(newNote.rating)}</span>
      </div>
      <div style="background:#fcfbfe; border-left:3px solid var(--purple); padding:8px 12px; border-radius:4px;">
        <span style="font-size:0.75rem; font-weight:700; color:#5937dd;">Fokus Bahasan: ${newNote.focusArea}</span>
        <p style="margin:4px 0 0; font-size:0.82rem; color:#4a4459;">${newNote.progressSummary}</p>
      </div>
      ${newNote.recommendations ? `<div style="font-size:0.78rem; color:#605973;"><strong>Rekomendasi:</strong> ${newNote.recommendations}</div>` : ''}
      ${newNote.nextStep ? `<div style="font-size:0.74rem; background:#f0edff; color:#5937dd; padding:6px 10px; border-radius:6px; font-weight:600;">🎯 Target / PR: ${newNote.nextStep}</div>` : ''}
    `;
    container.insertBefore(card, container.firstChild);
  }

  // Clear inputs
  document.getElementById('eval-focus').value = '';
  document.getElementById('eval-summary').value = '';
  document.getElementById('eval-recommendations').value = '';
  document.getElementById('eval-next-step').value = '';
}
