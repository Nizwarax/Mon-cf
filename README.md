# Bot Telegram Pemantau Lalu Lintas Cloudflare

Bot Telegram sederhana ini menggunakan metode *polling* untuk mengambil data lalu lintas (data dan permintaan) dari zona Cloudflare Anda dan menampilkannya langsung di Telegram.

## Cara Menggunakan

Ikuti tiga langkah mudah di bawah ini untuk menjalankan bot.

### Langkah 1: Isi Kredensial Anda

Buka file `mon.js` dengan editor teks. Di bagian paling atas file, Anda akan menemukan bagian `KONFIGURASI`. Isi nilai untuk variabel berikut:

-   `TELEGRAM_BOT_TOKEN`: Token bot Telegram Anda dari [@BotFather](https://t.me/botfather).
-   `CLOUDFLARE_API_TOKEN`: Token API dari dasbor Cloudflare Anda. Pastikan token memiliki izin `Zone.Analytics:Read`.
-   `CLOUDFLARE_ZONE_ID`: ID Zona dari domain yang ingin Anda pantau di Cloudflare.

### Langkah 2: Instal Dependensi

Buka terminal atau command prompt di direktori proyek ini dan jalankan perintah berikut untuk menginstal pustaka yang diperlukan:

```bash
npm install
```

### Langkah 3: Jalankan Bot

Setelah dependensi terinstal, jalankan bot dengan perintah berikut:

```bash
node mon.js
```

Jika berhasil, Anda akan melihat pesan "Bot berhasil dijalankan dan siap menerima perintah..." di terminal Anda. Sekarang Anda dapat membuka Telegram dan berinteraksi dengan bot Anda.

## Perintah Bot

-   `/start`: Menampilkan pesan selamat datang.
-   `/traffic`: Mengambil dan menampilkan data lalu lintas Cloudflare untuk 10 hari terakhir.