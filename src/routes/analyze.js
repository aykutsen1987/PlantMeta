// ============================================================
// routes/analyze.js
// POST /api/v1/analyze — Bitki fotoğrafını analiz et
// ============================================================

const express = require('express');
const multer  = require('multer');
const sharp   = require('sharp');
const { analyzePlant } = require('../services/openaiService');

const router = express.Router();

// Multer: bellekte tut, diske yazma (Render.com ephemeral disk)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Yalnızca görsel dosyaları kabul edilir.'));
        }
        cb(null, true);
    }
});

/**
 * POST /api/v1/analyze
 * Body (multipart/form-data):
 *   image    — JPEG/PNG görsel
 *   language — Yanıt dili kodu (tr, en, de, fr, es, it, ar). Varsayılan: tr
 */
router.post('/analyze', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Görsel dosyası gerekli.' });
    }

    const lang = req.body.language || 'tr';

    try {
        // Görseli optimize et: max 1024px, JPEG %85
        const optimized = await sharp(req.file.buffer)
            .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 85 })
            .toBuffer();

        const result = await analyzePlant(optimized, lang);

        res.json(result);
    } catch (err) {
        console.error('[analyze] Hata:', err.message);

        if (err.message.includes('image')) {
            return res.status(400).json({ error: 'Görsel işlenemedi.' });
        }

        res.status(500).json({ error: 'Analiz sırasında hata oluştu.' });
    }
});

module.exports = router;
