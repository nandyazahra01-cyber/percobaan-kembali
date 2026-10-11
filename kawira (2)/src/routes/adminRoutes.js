import express from 'express';
import db from '../database.js';

const router = express.Router();

/**
 * GET /api/admin/stats
 * Menampilkan agregat total data statistik dari database platform
 */
router.get('/stats', (req, res) => {
  try {
    const stats = db.getStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal memuat statistik agregat', error: error.message });
  }
});

/**
 * GET /api/admin/users
 * Menampilkan daftar seluruh akun pengguna
 */
router.get('/users', (req, res) => {
  try {
    const users = db.getUsers();
    res.json({
      success: true,
      data: users,
      count: users.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil data user', error: error.message });
  }
});

/**
 * PUT /api/admin/users/:id/status
 * Mengubah status akun user menjadi 'active' atau 'blocked'
 */
router.put('/users/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['active', 'blocked'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status tidak valid. Gunakan 'active' atau 'blocked'"
      });
    }

    const updatedUser = db.updateUserStatus(id, status);

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: `Pengguna dengan ID ${id} tidak ditemukan`
      });
    }

    res.json({
      success: true,
      message: `Status akun ${updatedUser.name} berhasil diubah menjadi '${status}'`,
      data: updatedUser
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengubah status akun', error: error.message });
  }
});

/**
 * GET /api/admin/logs
 * Menampilkan audit log aktivitas mentor & mentee real-time
 */
router.get('/logs', (req, res) => {
  try {
    const { role, action } = req.query;
    const logs = db.getLogs(role, action);
    res.json({
      success: true,
      data: logs,
      count: logs.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil audit logs', error: error.message });
  }
});

export default router;
