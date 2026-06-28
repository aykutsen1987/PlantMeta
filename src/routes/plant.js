// ============================================================
// routes/plant.js
// GET /api/v1/plant/info — Bilimsel ada göre bitki bilgisi
// ============================================================

const express = require('express');
const { getPlantInfo } = require('../services/openaiService');

const router = express.Router();

/**
 * GET /api/v1/plant/info?name=<bilimsel_ad>&lang=tr
 */
router.get('/plant/info', async (req, res) => {
    const { name, lang = 'tr' } = req.query;

    if (!name || name.trim().length < 2) {
        return res.status(400).json({ error: '"name" parametresi gerekli.' });
    }

    try {
        const info = await getPlantInfo(name.trim(), lang);
        res.json(info);
    } catch (err) {
        console.error('[plant/info] Hata:', err.message);
        res.status(500).json({ error: 'Bitki bilgisi alınamadı.' });
    }
});

module.exports = router;
