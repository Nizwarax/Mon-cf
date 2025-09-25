export default {
    async fetch(request, env) {
        // Memastikan permintaan datang dari webhook Telegram (metode POST)
        if (request.method === "POST") {
            try {
                const update = await request.json();
                if (update.message) {
                    await handleMessage(env, update.message);
                }
            } catch (e) {
                console.error("Gagal memproses pembaruan webhook:", e);
            }
        }
        // Telegram memerlukan respons 200 OK untuk mengonfirmasi penerimaan webhook.
        return new Response("OK");
    },
};

/**
 * Menangani logika pesan yang masuk dari Telegram.
 * @param {object} env - Variabel lingkungan worker (berisi secrets).
 * @param {object} message - Objek pesan dari pembaruan Telegram.
 */
async function handleMessage(env, message) {
    const chatId = message.chat.id;
    const text = message.text;

    if (text === "/start") {
        await sendMessage(env, chatId, "Selamat datang! Gunakan perintah `/traffic` untuk melihat data pemakaian Cloudflare.");
    } else if (text === "/traffic") {
        await sendMessage(env, chatId, "⏳ Sedang mengambil data lalu lintas, mohon tunggu...");
        await sendCloudflareTraffic(env, chatId);
    }
}

/**
 * Mengambil data dari Cloudflare dan mengirimkannya sebagai pesan Telegram.
 * @param {object} env - Variabel lingkungan worker.
 * @param {number} chatId - ID obrolan target.
 */
async function sendCloudflareTraffic(env, chatId) {
    try {
        const tenDaysAgo = getTenDaysAgoDate();
        const query = `
          query {
            viewer {
              zones(filter: { zoneTag: "${env.CLOUDFLARE_ZONE_ID}" }) {
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
                "Authorization": `Bearer ${env.CLOUDFLARE_API_TOKEN}`,
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

        await sendMessage(env, chatId, usageText);

    } catch (error) {
        console.error("Kesalahan saat mengambil data Cloudflare:", error);
        await sendMessage(env, chatId, `⚠️ Gagal mengambil data pemakaian.\n\n*Error:* \`${error.message}\``);
    }
}

/**
 * Mengirim pesan melalui API Bot Telegram.
 * @param {object} env - Variabel lingkungan worker.
 * @param {number} chatId - ID obrolan target.
 * @param {string} text - Teks pesan yang akan dikirim.
 */
async function sendMessage(env, chatId, text) {
    const url = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;
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
 * Menghitung tanggal 10 hari yang lalu dari sekarang.
 * @returns {string} Tanggal dalam format YYYY-MM-DD.
 */
const getTenDaysAgoDate = () => {
    const date = new Date();
    date.setDate(date.getDate() - 10);
    return date.toISOString().split("T")[0];
};