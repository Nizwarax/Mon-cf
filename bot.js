require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');
const fetch = require('node-fetch');

// --- Konfigurasi ---
const {
    TELEGRAM_BOT_TOKEN,
    CLOUDFLARE_API_TOKEN,
    CLOUDFLARE_ZONE_ID,
    SERVER_URL,
    PORT = 3000
} = process.env;

// --- Validasi Konfigurasi ---
if (!TELEGRAM_BOT_TOKEN || !CLOUDFLARE_API_TOKEN || !CLOUDFLARE_ZONE_ID || !SERVER_URL) {
    console.error("Kesalahan: Pastikan semua variabel lingkungan (TELEGRAM_BOT_TOKEN, CLOUDFLARE_API_TOKEN, CLOUDFLARE_ZONE_ID, SERVER_URL) telah diatur dalam file .env");
    process.exit(1);
}

// --- Inisialisasi Bot ---
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN);

// --- Pengaturan Webhook ---
const app = express();
app.use(bodyParser.json());

const webhookUrl = `${SERVER_URL}/webhook/${TELEGRAM_BOT_TOKEN}`;
bot.setWebHook(webhookUrl)
    .then(() => console.log(`Webhook berhasil diatur ke: ${webhookUrl}`))
    .catch(err => console.error("Gagal mengatur webhook:", err));

app.post(`/webhook/${TELEGRAM_BOT_TOKEN}`, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

// --- Logika Perintah Bot ---

/**
 * Mengambil tanggal 10 hari yang lalu dalam format YYYY-MM-DD.
 * @returns {string}
 */
const getTenDaysAgoDate = () => {
    const date = new Date();
    date.setDate(date.getDate() - 10);
    return date.toISOString().split("T")[0];
};

/**
 * Menangani perintah /traffic untuk mengambil dan mengirim data Cloudflare.
 * @param {number} chatId - ID obrolan Telegram.
 */
const handleTrafficCommand = async (chatId) => {
    try {
        const tenDaysAgo = getTenDaysAgoDate();
        const query = `
          query {
            viewer {
              zones(filter: { zoneTag: "${CLOUDFLARE_ZONE_ID}" }) {
                httpRequests1dGroups(
                  limit: 10,
                  orderBy: [date_DESC],
                  filter: { date_geq: "${tenDaysAgo}" }
                ) {
                  sum {
                    bytes
                    requests
                  }
                  dimensions {
                    date
                  }
                }
              }
            }
          }`;

        const response = await fetch("https://api.cloudflare.com/client/v4/graphql", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${CLOUDFLARE_API_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ query })
        });

        const result = await response.json();

        if (result.errors) {
            throw new Error(`Error dari API Cloudflare: ${result.errors.map(e => e.message).join(', ')}`);
        }

        if (!result.data || !result.data.viewer || !result.data.viewer.zones.length) {
            throw new Error("Gagal mengambil data pemakaian. Respons tidak valid dari Cloudflare.");
        }

        const trafficData = result.data.viewer.zones[0].httpRequests1dGroups;
        let usageText = "📊 *Data Pemakaian 10 Hari Terakhir:*\n\n";

        trafficData.forEach(day => {
            const date = day.dimensions.date;
            const totalDataGB = (day.sum.bytes / (1024 ** 3)).toFixed(2); // Konversi ke GB
            const totalRequests = day.sum.requests.toLocaleString('id-ID');

            usageText += `📅 *Tanggal:* ${date}\n`;
            usageText += `📦 *Total Data:* ${totalDataGB} GB\n`;
            usageText += `📈 *Total Permintaan:* ${totalRequests}\n\n`;
        });

        await bot.sendMessage(chatId, usageText, { parse_mode: "Markdown" });

    } catch (error) {
        console.error(error);
        await bot.sendMessage(chatId, `⚠️ Gagal mengambil data pemakaian.\n\n*Error:* \`${error.message}\``, { parse_mode: "Markdown" });
    }
};

// --- Event Listener Bot ---

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "Selamat datang! Gunakan perintah /traffic untuk melihat data pemakaian Cloudflare.");
});

bot.onText(/\/traffic/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "⏳ Sedang mengambil data lalu lintas, mohon tunggu...");
    handleTrafficCommand(chatId);
});

// --- Menjalankan Server ---
app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
});