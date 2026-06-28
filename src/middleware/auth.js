// ============================================================
// middleware/auth.js
// X-API-Key header doğrulaması
// ============================================================

module.exports = function authMiddleware(req, res, next) {
    // Sağlık endpoint'i auth gerektirmez
    if (req.path === '/v1/health') return next();

    const apiKey = req.headers['x-api-key'];

    if (!apiKey || apiKey !== process.env.PLANT_API_KEY) {
        return res.status(401).json({ error: 'Geçersiz API anahtarı.' });
    }

    next();
};
