const CLOUDFLARE_API_TOKEN = "<CLOUDFLARE_API_TOKEN>";
const CLOUDFLARE_ZONE_ID = "<CLOUDFLARE_ZONE_ID>";

const getTenDaysAgoDate = () => {
    const date = new Date();
    date.setDate(date.getDate() - 10); 
    return date.toISOString().split("T")[0]; 
};

bot.onText(/\/traffic/, async (msg) => {
    const chatId = msg.chat.id;
    const tenDaysAgo = getTenDaysAgoDate(); 

    try {
        const response = await fetch("https://api.cloudflare.com/client/v4/graphql", {
            method: "POST",
            headers: {
                "Authorization": Bearer ${CLOUDFLARE_API_TOKEN},
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                query: query {
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
                }
            })
        });

        const result = await response.json();
        console.log(result); // Debugging

        if (!result.data || !result.data.viewer || !result.data.viewer.zones.length) {
            throw new Error("⚠️ Gagal mengambil data pemakaian.");
        }

        let usageText = "*📊 Data Pemakaian 10 Hari Terakhir:*\n\n";
        result.data.viewer.zones[0].httpRequests1dGroups.forEach(day => {
            const tanggal = day.dimensions.date;
            const totalData = (day.sum.bytes / (1024 ** 4)).toFixed(2); // Konversi ke TB
            const totalRequests = day.sum.requests.toLocaleString();

            usageText += 📅 *Tanggal:* ${tanggal}\n📦 *Total Data:* ${totalData} TB\n📊 *Total Requests:* ${totalRequests}\n\n;
        });

        await bot.sendMessage(chatId, usageText, { 
            parse_mode: "Markdown"
        });

    } catch (error) {
        console.error(error); // Debugging error
        await bot.sendMessage(chatId, ⚠️ Gagal mengambil data pemakaian.\n\n_Error:_ ${error.message}, { parse_mode: "Markdown" });
    }
});
