# Bot Telegram Pemantau Lalu Lintas Cloudflare (Edisi Worker)

Bot Telegram ini dirancang untuk berjalan di lingkungan serverless seperti Cloudflare Workers. Bot ini memungkinkan Anda untuk memantau penggunaan lalu lintas (data dan permintaan) dari zona Cloudflare Anda langsung dari Telegram.

## Fitur

- **Serverless**: Dijalankan sebagai worker, tidak memerlukan server khusus.
- **Berbasis Webhook**: Menggunakan webhook untuk efisiensi dan respons instan.
- **Aman**: Kredensial dikelola sebagai *secrets* di lingkungan worker.
- **Ringan**: Tidak ada dependensi eksternal, hanya menggunakan API bawaan worker.

## Prasyarat

- Akun [Cloudflare](https://www.cloudflare.com/) dengan akses ke Workers.
- Akun [Telegram](https://telegram.org/) dan sebuah bot Telegram (dibuat melalui [@BotFather](https://t.me/botfather)).

## Cara Implementasi

### 1. Buat Worker Baru

1.  Masuk ke dasbor Cloudflare Anda.
2.  Navigasi ke menu **Workers & Pages**.
3.  Klik **Create application** > **Create Worker**.
4.  Beri nama worker Anda (misalnya, `telegram-traffic-bot`) dan klik **Deploy**.

### 2. Konfigurasi Skrip Worker

1.  Setelah worker di-deploy, klik **Edit code**.
2.  Salin seluruh konten dari file `mon.js` dan tempelkan ke editor kode, menimpa kode default.
3.  Klik **Save and deploy**.

### 3. Atur Secrets (Variabel Lingkungan)

Kredensial bot harus disimpan sebagai *secrets* agar aman.

1.  Di halaman worker Anda, buka tab **Settings** > **Variables**.
2.  Di bawah bagian **Environment Variables**, klik **Add variable** untuk setiap variabel berikut. Pastikan untuk mengklik **Encrypt** agar nilainya aman.

    -   `TELEGRAM_BOT_TOKEN`: Token bot Anda dari BotFather.
    -   `CLOUDFLARE_API_TOKEN`: Token API Cloudflare. Pastikan token memiliki izin `Zone.Analytics:Read`.
    -   `CLOUDFLARE_ZONE_ID`: ID Zona Cloudflare yang ingin Anda pantau.

### 4. Atur Webhook Telegram

Agar Telegram tahu ke mana harus mengirim pembaruan, Anda perlu mengatur webhook.

1.  Dapatkan URL worker Anda dari halaman utama worker (misalnya, `https://telegram-traffic-bot.nama-anda.workers.dev`).
2.  Buka browser Anda dan jalankan URL berikut, ganti `YOUR_BOT_TOKEN` dan `YOUR_WORKER_URL` dengan nilai Anda:

    ```
    https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=<YOUR_WORKER_URL>
    ```

    Contoh:
    ```
    https://api.telegram.org/bot12345:ABC-DEF/setWebhook?url=https://telegram-traffic-bot.nama-anda.workers.dev
    ```

3.  Jika berhasil, Anda akan melihat respons JSON seperti ini:
    ```json
    {
      "ok": true,
      "result": true,
      "description": "Webhook was set"
    }
    ```

### 5. Selesai!

Bot Anda sekarang aktif dan berjalan. Anda dapat mulai berinteraksi dengannya di Telegram.

## Perintah yang Tersedia

-   `/start`: Menampilkan pesan selamat datang.
-   `/traffic`: Mengambil dan menampilkan data lalu lintas Cloudflare untuk 10 hari terakhir.