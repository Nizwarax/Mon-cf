# Bot Telegram Pemantau Lalu Lintas Cloudflare (untuk Worker)

Skrip ini dirancang untuk dijalankan sebagai **Cloudflare Worker**. Bot ini memungkinkan Anda memantau penggunaan lalu lintas (data dan permintaan) dari zona Cloudflare Anda langsung dari Telegram, tanpa memerlukan server.

## Cara Kerja

-   **Serverless**: Berjalan di infrastruktur Cloudflare, sehingga Anda tidak perlu mengelola server.
-   **Webhook**: Telegram mengirim pembaruan langsung ke worker Anda, membuatnya sangat efisien.
-   **Aman**: Semua kunci API dan token disimpan sebagai **secrets** terenkripsi di dasbor Cloudflare, bukan di dalam kode.

---

## Panduan Implementasi (Langkah demi Langkah)

### Langkah 1: Buat Bot Telegram

1.  Buka Telegram dan cari `@BotFather`.
2.  Ketik `/newbot` dan ikuti petunjuknya.
3.  Setelah selesai, BotFather akan memberi Anda **token API**. Simpan token ini, Anda akan membutuhkannya.

### Langkah 2: Dapatkan Kredensial Cloudflare

1.  **Zone ID**:
    *   Masuk ke dasbor Cloudflare Anda.
    *   Pilih domain Anda.
    *   Di halaman "Overview", salin **Zone ID** Anda dari sisi kanan bawah.
2.  **API Token**:
    *   Klik ikon profil Anda di kanan atas > **My Profile** > **API Tokens**.
    *   Klik **Create Token**.
    *   Gunakan templat "Read Analytics" atau buat token kustom dengan izin: `Zone:Analytics:Read`.
    *   Pilih zona yang benar dan simpan token yang baru dibuat.

### Langkah 3: Deploy Worker & Atur Secrets

1.  Di dasbor Cloudflare, navigasi ke **Workers & Pages**.
2.  Klik **Create application** > **Create Worker**. Beri nama dan klik **Deploy**.
3.  Setelah worker dibuat, klik **Edit code**. Hapus kode contoh dan **salin-tempel seluruh isi file `mon.js`** ke editor. Klik **Save and deploy**.
4.  Sekarang, atur *secrets* Anda:
    *   Buka tab **Settings** > **Variables**.
    *   Di bawah **Environment Variables**, klik **Add variable** untuk setiap item di bawah ini. **PENTING: Centang "Encrypt"** untuk setiap variabel.
        *   `TELEGRAM_BOT_TOKEN`: Isi dengan token dari BotFather.
        *   `CLOUDFLARE_API_TOKEN`: Isi dengan token API Cloudflare Anda.
        *   `CLOUDFLARE_ZONE_ID`: Isi dengan Zone ID Anda.

### Langkah 4: Hubungkan Telegram ke Worker Anda (Set Webhook)

1.  Dapatkan URL worker Anda dari halaman utama worker (contoh: `https://nama-bot.akun-anda.workers.dev`).
2.  Buka tab browser baru dan jalankan URL berikut. Ganti `YOUR_BOT_TOKEN` dan `YOUR_WORKER_URL` dengan nilai Anda:

    ```
    https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=<YOUR_WORKER_URL>
    ```

    **Contoh:**
    ```
    https://api.telegram.org/bot12345:ABC-DEF/setWebhook?url=https://nama-bot.akun-anda.workers.dev
    ```
3.  Jika berhasil, Anda akan melihat pesan `{ "ok": true, "result": true, ... }`.

**Selesai!** Bot Anda sekarang sudah aktif.

## Perintah Bot

-   `/start`: Menampilkan pesan selamat datang.
-   `/traffic`: Menampilkan laporan penggunaan lalu lintas 10 hari terakhir.