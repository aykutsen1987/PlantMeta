// ============================================================
// PlantMeta Backend — src/index.js
// Express sunucusu, tüm route ve middleware'leri bağlar
// ============================================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const authMiddleware = require('./middleware/auth');
const analyzeRouter  = require('./routes/analyze');
const plantRouter    = require('./routes/plant');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ───────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Rate limiting: IP başına dakikada 30 istek
const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    message: { error: 'Çok fazla istek. Lütfen bekleyin.' }
});
app.use('/api/', limiter);

// API Key doğrulama (tüm /api/ rotaları için)
app.use('/api/', authMiddleware);

// ── Rotalar ─────────────────────────────────────────────────
app.use('/api/v1', analyzeRouter);
app.use('/api/v1', plantRouter);

// Sağlık kontrolü (auth gerektirmez)
app.get('/api/v1/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint bulunamadı.' });
});

// Genel hata yakalayıcı
app.use((err, req, res, next) => {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'Sunucu hatası.' });
});

// ── Başlat ──────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`PlantMeta API çalışıyor → http://localhost:${PORT}`);
    console.log(`Ortam: ${process.env.NODE_ENV || 'development'}`);
});
