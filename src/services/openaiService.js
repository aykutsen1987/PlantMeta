// ============================================================
// services/openaiService.js
// OpenAI GPT-4o ile bitki analizi
// ============================================================

const OpenAI = require('openai');

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL  = process.env.OPENAI_MODEL || 'gpt-4o';

/**
 * Bitki görselini analiz eder.
 * @param {Buffer} imageBuffer - JPEG görsel buffer'ı
 * @param {string} lang - Yanıt dili kodu (tr, en, de ...)
 * @returns {Object} Analiz sonucu JSON
 */
async function analyzePlant(imageBuffer, lang = 'tr') {
    const base64Image = imageBuffer.toString('base64');

    const systemPrompt = getSystemPrompt(lang);

    const response = await client.chat.completions.create({
        model: MODEL,
        max_tokens: 2000,
        messages: [
            { role: 'system', content: systemPrompt },
            {
                role: 'user',
                content: [
                    {
                        type: 'image_url',
                        image_url: { url: `data:image/jpeg;base64,${base64Image}`, detail: 'high' }
                    },
                    { type: 'text', text: 'Bu bitkiyi analiz et ve JSON formatında yanıt ver.' }
                ]
            }
        ],
        response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    return JSON.parse(content);
}

/**
 * Bilimsel ada göre bitki bilgisi getirir.
 * @param {string} scientificName
 * @param {string} lang
 */
async function getPlantInfo(scientificName, lang = 'tr') {
    const response = await client.chat.completions.create({
        model: MODEL,
        max_tokens: 1500,
        messages: [
            {
                role: 'system',
                content: `Sen bir botanik uzmanısın. Kullanıcının sorduğu bitki hakkında detaylı bilgi ver. Yanıtını ${lang} dilinde ver. Sadece JSON formatında yanıt ver.`
            },
            {
                role: 'user',
                content: `"${scientificName}" bitkisi hakkında aşağıdaki JSON formatında bilgi ver:\n${PLANT_INFO_SCHEMA}`
            }
        ],
        response_format: { type: 'json_object' }
    });

    return JSON.parse(response.choices[0].message.content);
}

// ── Prompt ve Schema ─────────────────────────────────────────

function getSystemPrompt(lang) {
    const langName = {
        tr: 'Türkçe', en: 'English', de: 'Deutsch',
        fr: 'Français', es: 'Español', it: 'Italiano', ar: 'العربية'
    }[lang] || 'Türkçe';

    return `Sen uzman bir botanik ve bitki hastalıkları yapay zekasısın.
Görevin: Verilen bitki fotoğrafını analiz etmek.
Yanıt dili: ${langName}
Yanıtını SADECE aşağıdaki JSON formatında ver, başka açıklama ekleme:

${ANALYSIS_SCHEMA}`;
}

const ANALYSIS_SCHEMA = `{
  "identified": true,
  "confidence": 85,
  "plant": {
    "commonName": "Domates",
    "scientificName": "Solanum lycopersicum",
    "family": "Solanaceae",
    "type": "Sebze",
    "origin": "Güney Amerika",
    "regions": ["Akdeniz", "Tropik bölgeler"],
    "lifespan": "Tek yıllık",
    "indoorOutdoor": "Dış mekan",
    "avgHeight": "60-200 cm",
    "floweringPeriod": "Yaz",
    "growthRate": "Hızlı",
    "difficulty": "Orta",
    "waterNeed": "Yüksek",
    "humidityNeed": "Orta",
    "soilType": "Besin açısından zengin, iyi drene edilmiş",
    "phValue": "6.0-6.8",
    "lightNeed": "Tam güneş",
    "temperature": "18-27°C",
    "isToxic": false,
    "petSafe": true,
    "humanSafe": true,
    "description": "Bitkinin kısa açıklaması..."
  },
  "diseases": [
    {
      "name": "Erken yanıklık",
      "scientificName": "Alternaria solani",
      "severity": "Orta",
      "symptoms": "Yapraklarda koyu lekeler",
      "cause": "Mantar enfeksiyonu",
      "solutions": ["Hasta yaprakları temizle", "Fungisit uygula"],
      "prevention": "İyi havalandırma sağla"
    }
  ],
  "carePlan": [
    { "task": "Sulama", "frequency": "Her 2 günde bir", "notes": "Toprağı kontrol et" },
    { "task": "Gübre", "frequency": "2 haftada bir", "notes": "Potasyum açısından zengin gübre" }
  ]
}`;

const PLANT_INFO_SCHEMA = `{
  "commonName": "string",
  "scientificName": "string",
  "family": "string",
  "origin": "string",
  "description": "string",
  "waterNeed": "string",
  "lightNeed": "string",
  "temperature": "string",
  "soilType": "string",
  "isToxic": false,
  "petSafe": true,
  "careTips": ["string"]
}`;

module.exports = { analyzePlant, getPlantInfo };
