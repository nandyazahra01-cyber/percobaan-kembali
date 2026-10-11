import express from 'express';
import db from '../database.js';

const router = express.Router();

/**
 * GET /api/mentor/mentees
 * Menampilkan daftar mentee milik mentor yang sedang login
 */
router.get('/mentees', (req, res) => {
  try {
    const mentees = db.getMentees();
    res.json({
      success: true,
      data: mentees,
      count: mentees.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil daftar mentee', error: error.message });
  }
});

/**
 * GET /api/mentor/chat/:menteeId
 * Menampilkan pesan percakapan live antara mentor dan mentee tertentu
 */
router.get('/chat/:menteeId', (req, res) => {
  try {
    const { menteeId } = req.params;
    const chats = db.getChats(menteeId);
    const mentee = db.getMenteeById(menteeId);

    res.json({
      success: true,
      mentee: mentee || null,
      messages: chats
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal memuat pesan chat', error: error.message });
  }
});

/**
 * POST /api/mentor/chat/:menteeId
 * Mengirim pesan live chat baru dari mentor ke mentee
 */
router.post('/chat/:menteeId', (req, res) => {
  try {
    const { menteeId } = req.params;
    const { text, senderName } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({ success: false, message: 'Isi pesan tidak boleh kosong' });
    }

    const newMsg = db.addChat(menteeId, {
      sender: 'mentor',
      senderName: senderName || 'Aditya Ramadhan',
      text: text.trim()
    });

    res.status(201).json({
      success: true,
      message: 'Pesan berhasil dikirim',
      data: newMsg
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengirim pesan', error: error.message });
  }
});

/**
 * GET /api/mentor/notes/:menteeId
 * Mengambil riwayat catatan evaluasi mentoring
 */
router.get('/notes/:menteeId', (req, res) => {
  try {
    const { menteeId } = req.params;
    const notes = db.getNotes(menteeId);
    res.json({
      success: true,
      data: notes
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil catatan evaluasi', error: error.message });
  }
});

/**
 * POST /api/mentor/notes
 * Menginput catatan progres dan rekomendasi bagi bisnis mentee setelah sesi selesai
 */
router.post('/notes', (req, res) => {
  try {
    const { menteeId, focusArea, progressSummary, recommendations, nextStep, status, rating } = req.body;

    if (!menteeId || !focusArea || !progressSummary) {
      return res.status(400).json({
        success: false,
        message: 'Mohon lengkapi mentee, fokus bahasan, dan ringkasan progres'
      });
    }

    const note = db.addNote({
      menteeId,
      focusArea,
      progressSummary,
      recommendations: recommendations || '-',
      nextStep: nextStep || '-',
      status: status || 'Perlu Sesi Lanjutan',
      rating: rating || 5
    });

    res.status(201).json({
      success: true,
      message: 'Catatan & evaluasi mentoring berhasil disimpan',
      data: note
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal menyimpan catatan mentoring', error: error.message });
  }
});

export default router;
