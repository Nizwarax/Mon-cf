# Bot Telegram Pemantau Lalu Lintas Cloudflare (Worker dengan Kredensial Langsung)

Skrip ini dirancang untuk dijalankan sebagai **Cloudflare Worker**. Bot ini memungkinkan Anda memantau penggunaan lalu lintas Cloudflare langsung dari Telegram. Versi ini menggunakan kredensial yang dimasukkan langsung ke dalam kode.

---

## Panduan Implementasi (3 Langkah)

### Langkah 1: Isi Kredensial Anda di Dalam Skrip

1.  Buka file `mon.js` dengan editor teks.
2.  Di bagian paling atas file, Anda akan menemukan bagian `KONFIGURASI`.
3.  Ganti placeholder `"GANTI_DENGAN_..."` dengan nilai Anda yang sebenarnya untuk:
    -   `TELEGRAM_BOT_TOKEN`
    -   `CLOUDFLARE_API_TOKEN`
    -   `CLOUDFLARE_ZONE_ID`
4.  Simpan file `mon.js` setelah Anda selesai mengedit.
5.  Izin (Permissions) Sudah

Ini adalah penyebab paling umum. Saat Anda membuat token, Anda harus memberinya izin yang benar. Pastikan token Anda memiliki izin: `Zone:Analytics:Read`.
Detailnya: `Create Token -> Create Custom Token -> Beri nama -> Di bawah Permissions, pilih Zone, Analytics, dan Read`.

### Langkah 2: Deploy ke Cloudflare Worker

1.  Masuk ke dasbor Cloudflare Anda, lalu navigasi ke **Workers & Pages**.
2.  Klik **Create application** > **Create Worker**. Beri nama dan klik **Deploy**.
3.  Setelah worker dibuat, klik **Edit code**.
4.  **Hapus semua kode contoh** yang ada di editor.
5.  **Salin seluruh isi dari file `mon.js` yang sudah Anda edit**, lalu tempelkan ke dalam editor kode di dasbor Cloudflare.
6.  Klik **Save and deploy**.

### Langkah 3: Atur Webhook Telegram

1.  Dapatkan URL worker Anda dari halaman utama worker (contoh: `https://nama-bot.akun-anda.workers.dev`).
2.  Buka tab browser baru dan jalankan URL berikut. Ganti `YOUR_BOT_TOKEN` dan `YOUR_WORKER_URL` dengan nilai Anda:

    ```
    https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=<YOUR_WORKER_URL>
    ```

    **Contoh:**
    ```
    https://api.telegram.org/bot12345:ABC-DEF/setWebhook?url=https://nama-bot.akun-anda.workers.dev
    ```
3.  Jika berhasil, Anda akan melihat respons `{ "ok": true, ... }`.

**Selesai!** Bot Anda sekarang aktif dan siap digunakan.

## Perintah Bot

-   `/start`: Menampilkan pesan selamat datang.
-   `/traffic`: Menampilkan laporan penggunaan lalu lintas 10 hari terakhir.
