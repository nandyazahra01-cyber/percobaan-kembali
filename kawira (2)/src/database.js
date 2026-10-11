/**
 * Database module for KAWIRA Platform
 * Provides unified in-memory & file-backed store for users, mentees, mentoring notes, chats, and audit logs.
 */

const state = {
  users: [
    { id: 1, name: 'Kawira Anindya', email: 'kawira.anindya@student.ac.id', role: 'mentee', institution: 'FEB UNJ', status: 'active', createdAt: '2026-09-01T08:00:00Z' },
    { id: 2, name: 'Aditya Ramadhan', email: 'mentor.aditya@kawira.id', role: 'mentor', institution: 'Universitas Brawijaya', status: 'active', createdAt: '2026-08-15T09:30:00Z' },
    { id: 3, name: 'Fikri Ramadhan', email: 'fikri.r@student.itb.ac.id', role: 'mentee', institution: 'Institut Teknologi Bandung', status: 'active', createdAt: '2026-09-05T10:15:00Z' },
    { id: 4, name: 'Sari Indah Pertiwi', email: 'mentor.sari@kawira.id', role: 'mentor', institution: 'Universitas Gadjah Mada', status: 'active', createdAt: '2026-08-20T11:00:00Z' },
    { id: 5, name: 'Siti Nurhaliza', email: 'siti.nur@mail.ugm.ac.id', role: 'mentee', institution: 'Universitas Gadjah Mada', status: 'active', createdAt: '2026-09-12T14:20:00Z' },
    { id: 6, name: 'Budi Prasetyo', email: 'budi.prasetyo@unj.ac.id', role: 'mentee', institution: 'Universitas Negeri Jakarta', status: 'active', createdAt: '2026-09-14T16:00:00Z' },
    { id: 7, name: 'Dewi Anggraini', email: 'dewi.ang@student.ui.ac.id', role: 'mentee', institution: 'Universitas Indonesia', status: 'active', createdAt: '2026-09-02T13:45:00Z' },
    { id: 8, name: 'Nadya Sabrina Az-Zahra', email: 'admin.kawira@unj.ac.id', role: 'admin', institution: 'FEB UNJ (Tim MBG)', status: 'active', createdAt: '2026-08-01T07:00:00Z' },
    { id: 9, name: 'Irfan Maulana', email: 'irfan.spam@fake.id', role: 'mentee', institution: 'Kampus Swasta', status: 'blocked', createdAt: '2026-09-20T18:00:00Z' }
  ],

  mentees: [
    {
      id: 1,
      userId: 1,
      name: 'Kawira Anindya',
      email: 'kawira.anindya@student.ac.id',
      businessName: 'Dapur Nusantara',
      category: 'Kuliner & F&B',
      status: 'Aktif',
      online: true,
      lastSeen: 'Online sekarang',
      avatar: 'assets/fotoProfil.jpg',
      university: 'FEB Universitas Negeri Jakarta 2024',
      topic: 'Validasi HPP & Strategi Pre-Order Frozen Food',
      scheduledTime: 'Hari ini, 15:30 WIB',
      sessionsCompleted: 2,
      totalSessions: 4,
      notesCount: 2
    },
    {
      id: 2,
      userId: 3,
      name: 'Fikri Ramadhan',
      email: 'fikri.r@student.itb.ac.id',
      businessName: 'EcoCraft Studio',
      category: 'Kriya Ramah Lingkungan',
      status: 'Aktif',
      online: true,
      lastSeen: 'Online sekarang',
      avatar: 'assets/Nasywa.png',
      university: 'Institut Teknologi Bandung 2023',
      topic: 'Penyempurnaan BMC & Analisis Pasar B2B Korporat',
      scheduledTime: 'Besok, 13:00 WIB',
      sessionsCompleted: 1,
      totalSessions: 3,
      notesCount: 1
    },
    {
      id: 3,
      userId: 5,
      name: 'Siti Nurhaliza',
      email: 'siti.nur@mail.ugm.ac.id',
      businessName: 'ModisHijab Co.',
      category: 'Fashion & E-Commerce',
      status: 'Aktif',
      online: false,
      lastSeen: '12 menit lalu',
      avatar: 'assets/Ayunda.png',
      university: 'Universitas Gadjah Mada 2024',
      topic: 'Optimalisasi TikTok Shop & Meta Ads Campaign',
      scheduledTime: '14 Okt 2026, 16:00 WIB',
      sessionsCompleted: 1,
      totalSessions: 3,
      notesCount: 1
    },
    {
      id: 4,
      userId: 6,
      name: 'Budi Prasetyo',
      email: 'budi.prasetyo@unj.ac.id',
      businessName: 'WarungDigital POS',
      category: 'Teknologi & SaaS UMKM',
      status: 'Aktif',
      online: false,
      lastSeen: '1 jam lalu',
      avatar: 'assets/Image%20(Budi%20Santoso).png',
      university: 'Universitas Negeri Jakarta 2023',
      topic: 'Review Prototype UI & Pitch Deck P2MW',
      scheduledTime: '16 Okt 2026, 10:00 WIB',
      sessionsCompleted: 0,
      totalSessions: 2,
      notesCount: 0
    },
    {
      id: 5,
      userId: 7,
      name: 'Dewi Anggraini',
      email: 'dewi.ang@student.ui.ac.id',
      businessName: 'Sambal Bu Dewi',
      category: 'Kuliner Tradisional',
      status: 'Selesai',
      online: false,
      lastSeen: 'Kemarin',
      avatar: 'assets/Novy.jpeg',
      university: 'Universitas Indonesia 2023',
      topic: 'Sertifikasi Halal & Ekspansi Retail Mini Market',
      scheduledTime: 'Selesai (3 Sesi)',
      sessionsCompleted: 3,
      totalSessions: 3,
      notesCount: 3
    }
  ],

  notes: [
    {
      id: 1,
      menteeId: 1,
      mentorName: 'Aditya Ramadhan',
      sessionDate: '2026-10-08',
      focusArea: 'Riset Pasar & Validasi Target Konsumen',
      progressSummary: 'Kawira telah menguji 30 sampel makanan beku ke mahasiswa kampus A dan B. Feedback rasa 92% positif, namun harga dinilai perlu opsi paket hemat.',
      recommendations: 'Buat bundling 3 pack seharga Rp 75.000 untuk meningkatkan Average Order Value (AOV). Rapikan laporan laba kotor di fitur Pembukuan Kawira.',
      nextStep: 'Hitung HPP bahan baku per gram dan uji promo pre-order.',
      status: 'Perlu Sesi Lanjutan',
      rating: 5,
      createdAt: '2026-10-08T16:45:00Z'
    },
    {
      id: 2,
      menteeId: 2,
      mentorName: 'Aditya Ramadhan',
      sessionDate: '2026-10-09',
      focusArea: 'Business Model Canvas (Key Partners & Cost Structure)',
      progressSummary: 'Fikri sudah mengamankan pemasok limbah kayu daur ulang dengan biaya bahan baku 40% lebih rendah dibanding estimasi awal.',
      recommendations: 'Fokus pada segmen suvenir wisuda dan seminar kit kampus terlebih dahulu sebelum menyasar pesanan B2B korporasi besar.',
      nextStep: 'Finalisasi portofolio katalog fisik & mockup produk di Canva.',
      status: 'Perlu Sesi Lanjutan',
      rating: 4,
      createdAt: '2026-10-09T14:30:00Z'
    }
  ],

  chats: {
    1: [
      { id: 1, sender: 'mentee', senderName: 'Kawira Anindya', text: 'Halo Kak Aditya! Selamat sore, terima kasih sudah menerima jadwal bimbingan kami.', timestamp: '14:20' },
      { id: 2, sender: 'mentor', senderName: 'Aditya Ramadhan', text: 'Sore Kawira! Sama-sama. Bagaimana kabar Dapur Nusantara? Ada progres apa dari catatan sesi kemarin?', timestamp: '14:22' },
      { id: 3, sender: 'mentee', senderName: 'Kawira Anindya', text: 'Sudah dihitung ulang Kak, margin laba kotor kami ada di 42% setelah menghitung kemasan vacuum seal. Tapi kami ragu di penentuan harga bundling.', timestamp: '14:25' },
      { id: 4, sender: 'mentor', senderName: 'Aditya Ramadhan', text: 'Bagus sekali! Margin 42% untuk makanan olahan sudah sangat sehat. Nanti di sesi jam 15:30 kita bahas simulasinya langsung di spreadsheet ya.', timestamp: '14:28' }
    ],
    2: [
      { id: 1, sender: 'mentee', senderName: 'Fikri Ramadhan', text: 'Kak Aditya, template BMC dari Modul 2 sudah saya isi lengkap. Boleh ditinjau?', timestamp: '09:15' },
      { id: 2, sender: 'mentor', senderName: 'Aditya Ramadhan', text: 'Bagus Fikri! Nanti saya cek detailnya sebelum sesi besok jam 13:00 ya.', timestamp: '09:40' }
    ],
    3: [
      { id: 1, sender: 'mentee', senderName: 'Siti Nurhaliza', text: 'Halo Kak, untuk sesi TikTok Shop apakah perlu siapkan laporan dashboard analytics dulu?', timestamp: 'Kemarin' },
      { id: 2, sender: 'mentor', senderName: 'Aditya Ramadhan', text: 'Iya Siti, siapkan metrik CTR dan RoAS 14 hari terakhir ya supaya review lebih tajam.', timestamp: 'Kemarin' }
    ]
  },

  auditLogs: [
    { id: 1, timestamp: '11 Okt 2026, 08:14:20', userName: 'Aditya Ramadhan', role: 'Mentor', action: 'Login ke Mentor Workspace', ip: '180.252.164.12', status: 'Success' },
    { id: 2, timestamp: '11 Okt 2026, 08:12:05', userName: 'Kawira Anindya', role: 'Mentee', action: 'Membuka Modul 2: BMC', ip: '114.124.201.88', status: 'Success' },
    { id: 3, timestamp: '11 Okt 2026, 08:05:40', userName: 'Kawira Anindya', role: 'Mentee', action: 'Input Transaksi Penjualan Rp 185.000', ip: '114.124.201.88', status: 'Success' },
    { id: 4, timestamp: '11 Okt 2026, 07:58:15', userName: 'Nadya Sabrina', role: 'Admin', action: 'Verifikasi Kurikulum Modul 2', ip: '10.240.0.1', status: 'Success' },
    { id: 5, timestamp: '11 Okt 2026, 07:45:30', userName: 'Fikri Ramadhan', role: 'Mentee', action: 'Kirim pesan live chat ke Mentor Aditya', ip: '125.160.18.42', status: 'Success' },
    { id: 6, timestamp: '11 Okt 2026, 07:30:10', userName: 'Irfan Maulana', role: 'Mentee', action: 'Upaya login berulang terdeteksi', ip: '103.28.12.99', status: 'Blocked' },
    { id: 7, timestamp: '11 Okt 2026, 07:15:22', userName: 'Sari Indah Pertiwi', role: 'Mentor', action: 'Perbarui Jadwal Konsultasi', ip: '182.1.84.19', status: 'Success' },
    { id: 8, timestamp: '11 Okt 2026, 06:50:00', userName: 'Budi Prasetyo', role: 'Mentee', action: 'Pendaftaran Akun Baru Mahasiswa', ip: '36.85.112.5', status: 'Success' }
  ]
};

export const db = {
  // Mentees & Mentor methods
  getMentees(mentorId) {
    return state.mentees;
  },

  getMenteeById(id) {
    return state.mentees.find(m => m.id === Number(id));
  },

  getChats(menteeId) {
    return state.chats[menteeId] || [];
  },

  addChat(menteeId, message) {
    if (!state.chats[menteeId]) {
      state.chats[menteeId] = [];
    }
    const newMsg = {
      id: Date.now(),
      sender: message.sender || 'mentor',
      senderName: message.senderName || 'Aditya Ramadhan',
      text: message.text,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };
    state.chats[menteeId].push(newMsg);

    // Record audit log
    this.addLog({
      userName: newMsg.senderName,
      role: newMsg.sender === 'mentor' ? 'Mentor' : 'Mentee',
      action: `Kirim pesan live chat (Mentee ID #${menteeId})`,
      ip: '127.0.0.1',
      status: 'Success'
    });

    return newMsg;
  },

  getNotes(menteeId) {
    if (menteeId) {
      return state.notes.filter(n => n.menteeId === Number(menteeId));
    }
    return state.notes;
  },

  addNote(noteData) {
    const newNote = {
      id: Date.now(),
      menteeId: Number(noteData.menteeId),
      mentorName: noteData.mentorName || 'Aditya Ramadhan',
      sessionDate: noteData.sessionDate || new Date().toISOString().split('T')[0],
      focusArea: noteData.focusArea,
      progressSummary: noteData.progressSummary,
      recommendations: noteData.recommendations,
      nextStep: noteData.nextStep,
      status: noteData.status || 'Perlu Sesi Lanjutan',
      rating: Number(noteData.rating) || 5,
      createdAt: new Date().toISOString()
    };
    state.notes.unshift(newNote);

    // Update mentee notes count
    const mentee = this.getMenteeById(noteData.menteeId);
    if (mentee) {
      mentee.notesCount = (mentee.notesCount || 0) + 1;
    }

    // Record audit log
    this.addLog({
      userName: newNote.mentorName,
      role: 'Mentor',
      action: `Input Catatan & Evaluasi Mentoring (Mentee #${newNote.menteeId})`,
      ip: '127.0.0.1',
      status: 'Success'
    });

    return newNote;
  },

  // Admin & Stats methods
  getStats() {
    const totalMentees = state.users.filter(u => u.role === 'mentee').length + 1420; // Aggregated with historical count
    const totalMentors = state.users.filter(u => u.role === 'mentor').length + 46;
    let totalChats = 8920;
    Object.values(state.chats).forEach(list => totalChats += list.length);
    const totalTransactions = 24850000;

    return {
      totalMentees,
      totalMentors,
      totalChats,
      totalTransactions,
      currencyFormat: 'Rp 24.850.000',
      activeMentoringSessions: state.mentees.filter(m => m.status === 'Aktif').length,
      publishedModules: 5,
      systemUptime: '99.98%'
    };
  },

  getUsers() {
    return state.users;
  },

  updateUserStatus(id, newStatus) {
    const user = state.users.find(u => u.id === Number(id));
    if (!user) return null;
    const oldStatus = user.status;
    user.status = newStatus;

    // Record audit log
    this.addLog({
      userName: 'Nadya Sabrina (Admin)',
      role: 'Admin',
      action: `Ubah status akun ${user.name} dari '${oldStatus}' menjadi '${newStatus}'`,
      ip: '127.0.0.1',
      status: 'Success'
    });

    return user;
  },

  getLogs(filterRole, filterAction) {
    let logs = [...state.auditLogs];
    if (filterRole && filterRole !== 'all') {
      logs = logs.filter(l => l.role.toLowerCase() === filterRole.toLowerCase());
    }
    if (filterAction && filterAction !== 'all') {
      logs = logs.filter(l => l.action.toLowerCase().includes(filterAction.toLowerCase()));
    }
    return logs;
  },

  addLog(log) {
    const newLog = {
      id: Date.now(),
      timestamp: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + new Date().toLocaleTimeString('id-ID'),
      userName: log.userName || 'System',
      role: log.role || 'System',
      action: log.action || 'Aktivitas sistem',
      ip: log.ip || '127.0.0.1',
      status: log.status || 'Success'
    };
    state.auditLogs.unshift(newLog);
    if (state.auditLogs.length > 50) {
      state.auditLogs.pop();
    }
    return newLog;
  }
};

export default db;
