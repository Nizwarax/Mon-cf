// =================================================================
// KONFIGURASI - SILAKAN ISI KREDENSIAL ANDA DI BAWAH INI
// =================================================================

// 1. Masukkan token bot Telegram Anda yang didapat dari @BotFather
const TELEGRAM_BOT_TOKEN = "GANTI_DENGAN_TOKEN_TELEGRAM_ANDA";

// 2. Masukkan token API Cloudflare Anda
//    (Buat di: https://dash.cloudflare.com/profile/api-tokens dengan izin Zone.Analytics:Read)
const CLOUDFLARE_API_TOKEN = "GANTI_DENGAN_TOKEN_CLOUDFLARE_ANDA";

// 3. Masukkan ID Zona Cloudflare Anda
//    (Dapat ditemukan di halaman utama domain Anda di Cloudflare)
const CLOUDFLARE_ZONE_ID = "GANTI_DENGAN_ID_ZONA_ANDA";

// =================================================================
// KODE BOT - TIDAK PERLU MENGUBAH APA PUN DI BAWAH INI
// =================================================================

const TelegramBot = require('node-telegram-bot-api');
const fetch = require('node-fetch');

// Validasi sederhana untuk memastikan token telah diisi
if (TELEGRAM_BOT_TOKEN === "GANTI_DENGAN_TOKEN_TELEGRAM_ANDA" || CLOUDFLARE_API_TOKEN === "GANTI_DENGAN_TOKEN_CLOUDFLARE_ANDA" || CLOUDFLARE_ZONE_ID === "GANTI_DENGAN_ID_ZONA_ANDA") {
    console.error("Kesalahan: Harap isi semua kredensial yang diperlukan (TELEGRAM_BOT_TOKEN, CLOUDFLARE_API_TOKEN, CLOUDFLARE_ZONE_ID) di dalam file mon.js.");
    process.exit(1);
}

// Inisialisasi bot dengan metode polling
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

console.log("Bot berhasil dijalankan dan siap menerima perintah...");

/**
 * Mendapatkan tanggal 10 hari yang lalu dalam format YYYY-MM-DD.
 */
const getTenDaysAgoDate = () => {
    const date = new Date();
    date.setDate(date.getDate() - 10);
    return date.toISOString().split("T")[0];
};

// Menangani perintah /traffic
bot.onText(/\/traffic/, async (msg) => {
    const chatId = msg.chat.id;
    await bot.sendMessage(chatId, "⏳ Sedang mengambil data lalu lintas, mohon tunggu...");

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
        console.error("Terjadi kesalahan:", error);
        await bot.sendMessage(chatId, `⚠️ Gagal mengambil data pemakaian.\n\n*Error:* \`${error.message}\``, { parse_mode: "Markdown" });
    }
});

// Menangani perintah /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "Selamat datang! Gunakan perintah `/traffic` untuk melihat data pemakaian Cloudflare.");
});