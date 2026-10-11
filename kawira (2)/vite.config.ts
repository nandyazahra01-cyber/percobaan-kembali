import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), '.'),
      },
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(process.cwd(), 'index.html'),
          login: path.resolve(process.cwd(), 'login.html'),
          loginStaff: path.resolve(process.cwd(), 'login-staff.html'),
          register: path.resolve(process.cwd(), 'register.html'),
          dashboard: path.resolve(process.cwd(), 'dashboard.html'),
          chatMentor: path.resolve(process.cwd(), 'chat-mentor.html'),
          detailModul1: path.resolve(process.cwd(), 'detail-modul-1.html'),
          detailModul2: path.resolve(process.cwd(), 'detail-modul-2.html'),
          komunitas: path.resolve(process.cwd(), 'komunitas.html'),
          mentoring: path.resolve(process.cwd(), 'mentoring.html'),
          modul: path.resolve(process.cwd(), 'modul.html'),
          pembukuan: path.resolve(process.cwd(), 'pembukuan.html'),
          profile: path.resolve(process.cwd(), 'profile.html'),
          riwayatInvoice: path.resolve(process.cwd(), 'riwayat-invoice.html'),
          timKami: path.resolve(process.cwd(), 'tim-kami.html'),
          dashboardMentor: path.resolve(process.cwd(), 'dashboard-mentor.html'),
          dashboardAdmin: path.resolve(process.cwd(), 'dashboard-admin.html'),
          mentorWorkspace: path.resolve(process.cwd(), 'mentor-workspace.html'),
          adminDashboard: path.resolve(process.cwd(), 'admin-dashboard.html'),
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
