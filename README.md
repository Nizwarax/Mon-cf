# Bot Telegram Pemantau Lalu Lintas Cloudflare

Bot Telegram ini memungkinkan Anda untuk memantau penggunaan lalu lintas (data dan permintaan) dari zona Cloudflare Anda langsung dari Telegram. Bot ini menggunakan API GraphQL Cloudflare untuk mengambil data 10 hari terakhir dan menyajikannya dalam format yang mudah dibaca.

## Fitur

- **Ambil Data Lalu Lintas**: Dapatkan laporan penggunaan data dan jumlah permintaan selama 10 hari terakhir.
- **Berbasis Webhook**: Menggunakan webhook untuk efisiensi, sehingga tidak perlu melakukan polling.
- **Konfigurasi Mudah**: Cukup atur beberapa variabel lingkungan untuk memulai.
- **Dibuat dengan Node.js**: Menggunakan Express.js untuk server webhook dan `node-telegram-bot-api` untuk interaksi dengan Telegram.

## Prasyarat

- [Node.js](https://nodejs.org/) (versi 14 atau lebih tinggi)
- Akun [Cloudflare](https://www.cloudflare.com/)
- Akun [Telegram](https://telegram.org/) dan sebuah bot Telegram (dibuat melalui [BotFather](https://t.me/botfather))

## Instalasi

1.  **Kloning Repositori:**
    ```bash
    git clone https://github.com/akun-anda/nama-repo.git
    cd nama-repo
    ```

2.  **Instal Dependensi:**
    ```bash
    npm install
    ```

## Konfigurasi

Bot ini memerlukan beberapa kredensial untuk dapat berfungsi. Buat file `.env` di direktori root proyek dan tambahkan variabel berikut:

```env
# Token bot dari BotFather
TELEGRAM_BOT_TOKEN="ISI_DENGAN_TOKEN_BOT_ANDA"

# Token API Cloudflare (buat di https://dash.cloudflare.com/profile/api-tokens)
# Pastikan token memiliki izin: Zone.Analytics:Read
CLOUDFLARE_API_TOKEN="ISI_DENGAN_TOKEN_CLOUDFLARE_ANDA"

# ID Zona Cloudflare Anda (dapat ditemukan di halaman utama domain Anda di Cloudflare)
CLOUDFLARE_ZONE_ID="ISI_DENGAN_ID_ZONA_ANDA"

# URL publik tempat server ini akan berjalan (misalnya, https://domain-anda.com atau URL ngrok)
SERVER_URL="ISI_DENGAN_URL_SERVER_ANDA"

# Port untuk server (opsional, default ke 3000)
PORT=3000
```

### Cara Mendapatkan Kredensial

-   **`TELEGRAM_BOT_TOKEN`**: Bicara dengan [@BotFather](https://t.me/botfather) di Telegram dan ikuti instruksi untuk membuat bot baru. Anda akan menerima token unik.
-   **`CLOUDFLARE_API_TOKEN`**:
    1.  Masuk ke dasbor Cloudflare.
    2.  Buka [API Tokens](https://dash.cloudflare.com/profile/api-tokens).
    3.  Klik "Create Token".
    4.  Gunakan templat "Read Analytics" atau buat token kustom dengan izin `Zone:Analytics:Read`.
    5.  Pilih zona yang ingin Anda pantau.
-   **`CLOUDFLARE_ZONE_ID`**:
    1.  Pilih domain Anda di dasbor Cloudflare.
    2.  Di halaman "Overview", gulir ke bawah dan Anda akan menemukan "Zone ID" di sisi kanan.
-   **`SERVER_URL`**:
    Agar Telegram dapat mengirim pembaruan ke bot Anda, server harus dapat diakses secara publik. Anda dapat menggunakan layanan seperti [ngrok](https://ngrok.com/) untuk pengembangan lokal atau menyebarkan aplikasi ini ke platform hosting seperti Heroku, Vercel, atau server pribadi.

## Menjalankan Bot

Setelah Anda mengonfigurasi file `.env`, jalankan server dengan perintah berikut:

```bash
npm start
```

Server akan berjalan dan secara otomatis mengatur webhook dengan Telegram. Anda sekarang dapat berinteraksi dengan bot Anda di Telegram.

## Perintah yang Tersedia

-   `/start`: Menampilkan pesan selamat datang.
-   `/traffic`: Mengambil dan menampilkan data lalu lintas Cloudflare untuk 10 hari terakhir.