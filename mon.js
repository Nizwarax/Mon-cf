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
// KODE WORKER - TIDAK PERLU MENGUBAH APA PUN DI BAWAH INI
// =================================================================

export default {
    async fetch(request) {
        // Hanya proses permintaan POST dari webhook Telegram
        if (request.method === "POST") {
            try {
                const update = await request.json();
                if (update.message) {
                    await handleMessage(update.message);
                }
            } catch (e) {
                console.error("Gagal memproses pembaruan webhook:", e);
            }
        }
        // Balas Telegram dengan status 200 OK untuk mengonfirmasi penerimaan webhook
        return new Response("OK");
    },
};

/**
 * Menangani pesan masuk dari Telegram.
 * @param {object} message - Objek pesan dari Telegram.
 */
async function handleMessage(message) {
    const chatId = message.chat.id;
    const text = message.text;

    if (text === "/start") {
        await sendMessage(chatId, "Selamat datang! Gunakan perintah `/traffic` untuk melihat data pemakaian Cloudflare.");
    } else if (text === "/traffic") {
        await sendMessage(chatId, "⏳ Sedang mengambil data lalu lintas, mohon tunggu...");
        await sendCloudflareTraffic(chatId);
    }
}

/**
 * Mengambil dan mengirimkan data lalu lintas dari Cloudflare.
 * @param {number} chatId - ID obrolan Telegram.
 */
async function sendCloudflareTraffic(chatId) {
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

        const cfResponse = await fetch("https://api.cloudflare.com/client/v4/graphql", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${CLOUDFLARE_API_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ query }),
        });

        const result = await cfResponse.json();

        if (result.errors) {
            throw new Error(`Error dari API Cloudflare: ${result.errors.map(e => e.message).join(', ')}`);
        }
        if (!result.data || !result.data.viewer || !result.data.viewer.zones.length) {
            throw new Error("Gagal mengambil data. Respons tidak valid dari Cloudflare.");
        }

        const trafficData = result.data.viewer.zones[0].httpRequests1dGroups;
        let usageText = "📊 *Data Pemakaian 10 Hari Terakhir:*\n\n";

        trafficData.forEach(day => {
            const date = day.dimensions.date;
            const totalDataGB = (day.sum.bytes / 1024 ** 3).toFixed(2);
            const totalRequests = day.sum.requests.toLocaleString('id-ID');
            usageText += `📅 *Tanggal:* ${date}\n📦 *Total Data:* ${totalDataGB} GB\n📈 *Total Permintaan:* ${totalRequests}\n\n`;
        });

        await sendMessage(chatId, usageText);

    } catch (error) {
        console.error("Kesalahan saat mengambil data Cloudflare:", error);
        await sendMessage(chatId, `⚠️ Gagal mengambil data pemakaian.\n\n*Error:* \`${error.message}\``);
    }
}

/**
 * Mengirim pesan ke pengguna melalui API Bot Telegram.
 * @param {number} chatId - ID obrolan Telegram.
 * @param {string} text - Teks pesan yang akan dikirim.
 */
async function sendMessage(chatId, text) {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const payload = {
        chat_id: chatId,
        text: text,
        parse_mode: "Markdown",
    };
    await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
}

/**
 * Mendapatkan tanggal 10 hari yang lalu dalam format YYYY-MM-DD.
 * @returns {string}
 */
const getTenDaysAgoDate = () => {
    const date = new Date();
    date.setDate(date.getDate() - 10);
    return date.toISOString().split("T")[0];
};
