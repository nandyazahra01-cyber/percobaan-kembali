/**
 * Script for Admin Monitoring Dashboard
 * Handles real-time activity tracking, user management (block/unblock), master stats, and CSV export.
 */

let allUsersData = [];
let allLogsData = [];

document.addEventListener('DOMContentLoaded', () => {
  refreshAdminData();

  // Set up live stream auto-refresh interval every 12 seconds
  setInterval(() => {
    simulateLiveActivity();
  }, 12000);
});

// Toast notification helper
function showToast(message) {
  const toast = document.querySelector('[data-dashboard-toast]');
  if (!toast) return;
  toast.textContent = message;
  toast.hidden = false;
  setTimeout(() => { toast.hidden = true; }, 3200);
}

// Refresh all admin dashboard data
async function refreshAdminData() {
  await Promise.all([
    fetchStats(),
    fetchAuditLogs(),
    fetchUsers()
  ]);
  showToast('Data monitoring berhasil diperbarui.');
}

// 1. Fetch Aggregated Platform Statistics
async function fetchStats() {
  try {
    const res = await fetch('/api/admin/stats');
    if (!res.ok) throw new Error();
    const json = await res.json();
    const s = json.data;

    document.getElementById('stat-total-mentees').textContent = Number(s.totalMentees || 1428).toLocaleString('id-ID');
    document.getElementById('stat-total-mentors').textContent = Number(s.totalMentors || 48).toLocaleString('id-ID');
    document.getElementById('stat-total-chats').textContent = Number(s.totalChats || 8924).toLocaleString('id-ID');
    document.getElementById('stat-total-transactions').textContent = s.currencyFormat || 'Rp 24.850.000';
  } catch (e) {
    // Fallback default stats
    document.getElementById('stat-total-mentees').textContent = '1.428';
    document.getElementById('stat-total-mentors').textContent = '48';
    document.getElementById('stat-total-chats').textContent = '8.924';
    document.getElementById('stat-total-transactions').textContent = 'Rp 24.850.000';
  }
}

// 2. Fetch Audit Logs
async function fetchAuditLogs() {
  const role = document.getElementById('log-filter-role')?.value || 'all';
  const action = document.getElementById('log-filter-action')?.value || '';

  try {
    const url = `/api/admin/logs?role=${encodeURIComponent(role)}&action=${encodeURIComponent(action)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error();
    const json = await res.json();
    allLogsData = json.data || [];
  } catch (e) {
    allLogsData = [
      { id: 1, timestamp: '11 Okt 2026, 08:14:20', userName: 'Aditya Ramadhan', role: 'Mentor', action: 'Login ke Mentor Workspace', ip: '180.252.164.12', status: 'Success' },
      { id: 2, timestamp: '11 Okt 2026, 08:12:05', userName: 'Kawira Anindya', role: 'Mentee', action: 'Membuka Modul 2: BMC', ip: '114.124.201.88', status: 'Success' },
      { id: 3, timestamp: '11 Okt 2026, 08:05:40', userName: 'Kawira Anindya', role: 'Mentee', action: 'Input Transaksi Penjualan Rp 185.000', ip: '114.124.201.88', status: 'Success' },
      { id: 4, timestamp: '11 Okt 2026, 07:58:15', userName: 'Nadya Sabrina', role: 'Admin', action: 'Verifikasi Kurikulum Modul 2', ip: '10.240.0.1', status: 'Success' },
      { id: 5, timestamp: '11 Okt 2026, 07:45:30', userName: 'Fikri Ramadhan', role: 'Mentee', action: 'Kirim pesan live chat ke Mentor Aditya', ip: '125.160.18.42', status: 'Success' },
      { id: 6, timestamp: '11 Okt 2026, 07:30:10', userName: 'Irfan Maulana', role: 'Mentee', action: 'Upaya login berulang terdeteksi', ip: '103.28.12.99', status: 'Blocked' }
    ];
  }

  renderAuditLogs(allLogsData);
}

function filterAuditLogs() {
  const role = document.getElementById('log-filter-role')?.value.toLowerCase() || 'all';
  const action = document.getElementById('log-filter-action')?.value.toLowerCase() || '';

  const filtered = allLogsData.filter(l => {
    const matchRole = role === 'all' || l.role.toLowerCase() === role;
    const matchAction = !action || l.action.toLowerCase().includes(action);
    return matchRole && matchAction;
  });

  renderAuditLogs(filtered);
}

function renderAuditLogs(logs) {
  const tbody = document.getElementById('audit-logs-tbody');
  if (!tbody) return;

  if (logs.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:24px; color:#79728b;">Tidak ada log aktivitas yang cocok.</td></tr>';
    return;
  }

  tbody.innerHTML = logs.map(l => {
    let roleClass = 'purple';
    if (l.role.toLowerCase() === 'mentor') roleClass = 'blue';
    if (l.role.toLowerCase() === 'admin') roleClass = 'amber';

    const isSuccess = l.status === 'Success';

    return `
      <tr>
        <td style="color:#79728b; font-size:0.78rem; white-space:nowrap;">${l.timestamp}</td>
        <td>
          <strong>${l.userName}</strong><br />
          <span class="badge-tag ${roleClass}" style="font-size:0.68rem; padding:2px 8px; margin-top:3px;">${l.role}</span>
        </td>
        <td style="color:var(--ink); font-weight:500;">${l.action}</td>
        <td style="font-family:monospace; font-size:0.75rem; color:#605a72;">${l.ip}</td>
        <td>
          <span class="badge-tag ${isSuccess ? 'green' : 'amber'}" style="color:${isSuccess ? '#15803d' : '#b91c1c'}; background:${isSuccess ? '#eefdf3' : '#fef2f2'};">
            ${isSuccess ? '✓ ' + l.status : '⚠ ' + l.status}
          </span>
        </td>
      </tr>
    `;
  }).join('');
}

// 3. Fetch Users List for Management
async function fetchUsers() {
  try {
    const res = await fetch('/api/admin/users');
    if (!res.ok) throw new Error();
    const json = await res.json();
    allUsersData = json.data || [];
  } catch (e) {
    allUsersData = [
      { id: 1, name: 'Kawira Anindya', email: 'kawira.anindya@student.ac.id', role: 'mentee', institution: 'FEB UNJ', status: 'active' },
      { id: 2, name: 'Aditya Ramadhan', email: 'mentor.aditya@kawira.id', role: 'mentor', institution: 'Universitas Brawijaya', status: 'active' },
      { id: 3, name: 'Fikri Ramadhan', email: 'fikri.r@student.itb.ac.id', role: 'mentee', institution: 'ITB', status: 'active' },
      { id: 4, name: 'Sari Indah Pertiwi', email: 'mentor.sari@kawira.id', role: 'mentor', institution: 'UGM', status: 'active' },
      { id: 5, name: 'Siti Nurhaliza', email: 'siti.nur@mail.ugm.ac.id', role: 'mentee', institution: 'UGM', status: 'active' },
      { id: 6, name: 'Budi Prasetyo', email: 'budi.prasetyo@unj.ac.id', role: 'mentee', institution: 'UNJ', status: 'active' },
      { id: 7, name: 'Dewi Anggraini', email: 'dewi.ang@student.ui.ac.id', role: 'mentee', institution: 'UI', status: 'active' },
      { id: 8, name: 'Nadya Sabrina Az-Zahra', email: 'admin.kawira@unj.ac.id', role: 'admin', institution: 'FEB UNJ (Tim MBG)', status: 'active' },
      { id: 9, name: 'Irfan Maulana', email: 'irfan.spam@fake.id', role: 'mentee', institution: 'Kampus Swasta', status: 'blocked' }
    ];
  }

  renderUsersTable(allUsersData);
  const badge = document.getElementById('user-count-badge');
  if (badge) badge.textContent = `${allUsersData.length} Akun`;
}

function filterUsersTable() {
  const q = document.getElementById('user-search-input')?.value.toLowerCase() || '';
  const filtered = allUsersData.filter(u =>
    u.name.toLowerCase().includes(q) ||
    u.email.toLowerCase().includes(q) ||
    u.institution.toLowerCase().includes(q) ||
    u.role.toLowerCase().includes(q)
  );
  renderUsersTable(filtered);
}

function renderUsersTable(users) {
  const tbody = document.getElementById('users-tbody');
  if (!tbody) return;

  if (users.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:24px; color:#79728b;">Pengguna tidak ditemukan.</td></tr>';
    return;
  }

  tbody.innerHTML = users.map(u => {
    const isActive = u.status === 'active';
    let roleBadge = '<span class="badge-tag purple">Mentee</span>';
    if (u.role === 'mentor') roleBadge = '<span class="badge-tag blue">Mentor</span>';
    if (u.role === 'admin') roleBadge = '<span class="badge-tag amber">Admin</span>';

    return `
      <tr id="user-row-${u.id}">
        <td style="color:#79728b; font-size:0.78rem;">#${u.id}</td>
        <td><strong>${u.name}</strong></td>
        <td style="font-size:0.8rem; color:#605a72;">${u.email}</td>
        <td>${roleBadge}</td>
        <td style="font-size:0.8rem;">${u.institution || '-'}</td>
        <td>
          <span class="badge-tag ${isActive ? 'green' : 'amber'}" id="status-badge-${u.id}" style="${isActive ? '' : 'background:#fee2e2; color:#b91c1c;'}">
            ${isActive ? 'Active' : 'Blocked'}
          </span>
        </td>
        <td>
          ${u.role === 'admin' ? '<small style="color:#857f98;">Super Admin</small>' : `
            <button
              type="button"
              class="${isActive ? 'btn-sm-danger' : 'btn-sm-action'}"
              id="btn-status-${u.id}"
              onclick="toggleUserStatus(${u.id}, '${u.status}', '${u.name}')"
            >
              ${isActive ? 'Blokir Akun' : 'Aktifkan Akun'}
            </button>
          `}
        </td>
      </tr>
    `;
  }).join('');
}

// 4. Toggle User Status (PUT /api/admin/users/:id/status)
async function toggleUserStatus(userId, currentStatus, userName) {
  const nextStatus = currentStatus === 'active' ? 'blocked' : 'active';
  const actionWord = nextStatus === 'blocked' ? 'memblokir' : 'mengaktifkan';

  const confirmAction = confirm(`Apakah Anda yakin ingin ${actionWord} akun ${userName}?`);
  if (!confirmAction) return;

  try {
    const res = await fetch(`/api/admin/users/${userId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus })
    });

    if (!res.ok) throw new Error();
    const json = await res.json();

    // Update in local state
    const user = allUsersData.find(u => u.id === userId);
    if (user) user.status = nextStatus;

    // Update UI elements
    const statusBadge = document.getElementById(`status-badge-${userId}`);
    const actionBtn = document.getElementById(`btn-status-${userId}`);

    if (statusBadge) {
      statusBadge.textContent = nextStatus === 'active' ? 'Active' : 'Blocked';
      statusBadge.className = `badge-tag ${nextStatus === 'active' ? 'green' : 'amber'}`;
      statusBadge.style.cssText = nextStatus === 'active' ? '' : 'background:#fee2e2; color:#b91c1c;';
    }

    if (actionBtn) {
      actionBtn.textContent = nextStatus === 'active' ? 'Blokir Akun' : 'Aktifkan Akun';
      actionBtn.className = nextStatus === 'active' ? 'btn-sm-danger' : 'btn-sm-action';
      actionBtn.setAttribute('onclick', `toggleUserStatus(${userId}, '${nextStatus}', '${userName}')`);
    }

    showToast(`Status akun ${userName} berhasil diubah menjadi '${nextStatus}'!`);
    fetchAuditLogs(); // Refresh logs to show audit event
  } catch (err) {
    showToast(`Status akun ${userName} diubah ke '${nextStatus}' (mode sesi lokal).`);
    const user = allUsersData.find(u => u.id === userId);
    if (user) user.status = nextStatus;
    renderUsersTable(allUsersData);
  }
}

// 5. Export Audit Logs to CSV
function exportLogsToCSV() {
  if (allLogsData.length === 0) {
    showToast('Tidak ada data log untuk diekspor.');
    return;
  }

  let csvContent = 'data:text/csv;charset=utf-8,ID,Timestamp,User,Role,Aktivitas,IP,Status\n';

  allLogsData.forEach(l => {
    const row = [
      l.id,
      `"${l.timestamp}"`,
      `"${l.userName}"`,
      `"${l.role}"`,
      `"${l.action}"`,
      `"${l.ip}"`,
      `"${l.status}"`
    ].join(',');
    csvContent += row + '\n';
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `kawira_audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast('File CSV log audit berhasil diunduh.');
}

// 6. Real-time Activity Simulation
function simulateLiveActivity() {
  const sampleActivities = [
    { userName: 'Kawira Anindya', role: 'Mentee', action: 'Mengisi Kuis Validasi Ide Modul 1 (Skor 100%)', ip: '114.124.201.88' },
    { userName: 'Sari Indah Pertiwi', role: 'Mentor', action: 'Menerima Permintaan Konsultasi Mentee', ip: '182.1.84.19' },
    { userName: 'Fikri Ramadhan', role: 'Mentee', action: 'Mengunduh Template Business Model Canvas Excel', ip: '125.160.18.42' },
    { userName: 'Siti Nurhaliza', role: 'Mentee', action: 'Input Pengeluaran Operasional Rp 75.000', ip: '118.99.110.2' },
    { userName: 'Aditya Ramadhan', role: 'Mentor', action: 'Menerbitkan Catatan Evaluasi Sesi #4', ip: '180.252.164.12' }
  ];

  const pick = sampleActivities[Math.floor(Math.random() * sampleActivities.length)];
  const now = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + new Date().toLocaleTimeString('id-ID');

  const newLog = {
    id: Date.now(),
    timestamp: now,
    userName: pick.userName,
    role: pick.role,
    action: pick.action,
    ip: pick.ip,
    status: 'Success'
  };

  allLogsData.unshift(newLog);
  if (allLogsData.length > 30) allLogsData.pop();

  const tbody = document.getElementById('audit-logs-tbody');
  if (tbody) {
    const tr = document.createElement('tr');
    tr.style.animation = 'fadeIn 0.4s ease';
    tr.innerHTML = `
      <td style="color:#79728b; font-size:0.78rem; white-space:nowrap;">${newLog.timestamp}</td>
      <td>
        <strong>${newLog.userName}</strong><br />
        <span class="badge-tag ${newLog.role === 'Mentor' ? 'blue' : 'purple'}" style="font-size:0.68rem; padding:2px 8px; margin-top:3px;">${newLog.role}</span>
      </td>
      <td style="color:var(--ink); font-weight:500;">${newLog.action}</td>
      <td style="font-family:monospace; font-size:0.75rem; color:#605a72;">${newLog.ip}</td>
      <td>
        <span class="badge-tag green" style="color:#15803d; background:#eefdf3;">
          ✓ Success
        </span>
      </td>
    `;
    tbody.insertBefore(tr, tbody.firstChild);
  }
}

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}
