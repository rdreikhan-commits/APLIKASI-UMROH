# 📊 Pendekatan Terstruktur — DFD & ERD
## Aplikasi ERP Umroh Mandala 525

---

## 1. Data Flow Diagram (DFD)

### Level 0 — Context Diagram

Gambaran sistem secara keseluruhan sebagai satu proses tunggal dengan semua entitas eksternal.

```mermaid
flowchart LR
    JM(["👤 Jamaah"])
    AT(["🛡️ Admin Travel"])
    AK(["💰 Admin Keuangan"])
    AP(["📦 Admin Perlengkapan"])
    MG(["👔 Manager"])
    AG(["🤝 Agent"])

    SISTEM["⚙️\nSISTEM ERP UMROH\nMANDALA 525"]

    JM -- "Data Registrasi, Booking,\nBukti Bayar, Dokumen" --> SISTEM
    SISTEM -- "Kode Booking, Status,\nTagihan, Surat" --> JM

    AT -- "Data Paket, Jadwal,\nKonten, Verifikasi Dok" --> SISTEM
    SISTEM -- "Laporan Jamaah,\nManifest, Konfirmasi" --> AT

    AK -- "Verifikasi Pembayaran,\nData Keuangan" --> SISTEM
    SISTEM -- "Laporan Keuangan,\nStatus Pembayaran" --> AK

    AP -- "Data Inventory,\nDistribusi, Pengajuan" --> SISTEM
    SISTEM -- "Status Stok,\nLaporan Distribusi" --> AP

    MG -- "Keputusan ACC Pengajuan" --> SISTEM
    SISTEM -- "Ringkasan Laporan,\nPengajuan Pending" --> MG

    AG -- "Referral Jamaah" --> SISTEM
    SISTEM -- "Laporan Komisi,\nBonus Agent" --> AG
```

---

### Level 1 — Diagram Detail per Proses

Memecah sistem menjadi sub-proses utama beserta aliran data dan penyimpanan (data store).

```mermaid
flowchart TD
    %% Entitas Eksternal
    JM(["👤 Jamaah"])
    AT(["🛡️ Admin Travel"])
    AK(["💰 Admin Keuangan"])
    AP(["📦 Admin Perlengkapan"])
    MG(["👔 Manager"])

    %% Sub-Proses
    P1["🔐 1.0\nManajemen Autentikasi\n& Akun"]
    P2["🕋 2.0\nManajemen Katalog\n& Paket Umroh"]
    P3["📋 3.0\nProses Booking\n& Reservasi"]
    P4["💳 4.0\nManajemen\nPembayaran"]
    P5["📄 5.0\nVerifikasi\nDokumen Jamaah"]
    P6["📦 6.0\nManajemen\nPerlengkapan"]
    P7["📊 7.0\nPelaporan &\nKeuangan"]
    P8["🖼️ 8.0\nManajemen Konten\n(Blog & Promo)"]

    %% Data Stores
    DS1[("🗄️ D1\nTabel: users")]
    DS2[("🗄️ D2\nTabel: paket_umroh")]
    DS3[("🗄️ D3\nTabel: jadwal")]
    DS4[("🗄️ D4\nTabel: bookings")]
    DS5[("🗄️ D5\nTabel: pembayaran")]
    DS6[("🗄️ D6\nTabel: master_perlengkapan\n& distribusi_perlengkapan")]
    DS7[("🗄️ D7\nTabel: pemasukan\n& pengeluaran")]
    DS8[("🗄️ D8\nTabel: articles\n& promo_banners")]

    %% Aliran P1 (Autentikasi)
    JM -- "Email, Password, Data Diri" --> P1
    P1 -- "Token JWT, Data Profil" --> JM
    P1 -- "Baca / Tulis Data User" --> DS1
    AT -- "Buat Akun Staff" --> P1

    %% Aliran P2 (Katalog)
    AT -- "Data Paket & Jadwal" --> P2
    P2 -- "Simpan Paket" --> DS2
    P2 -- "Simpan Jadwal" --> DS3
    P2 -- "Info Paket & Jadwal" --> JM

    %% Aliran P3 (Booking)
    JM -- "Pilih Jadwal, Data Booking" --> P3
    P3 -- "Baca Kuota Jadwal" --> DS3
    P3 -- "Update Kuota Tersisa" --> DS3
    P3 -- "Simpan Booking Baru" --> DS4
    P3 -- "Kode Booking, Status" --> JM

    %% Aliran P4 (Pembayaran)
    JM -- "Nominal, Bukti Transfer" --> P4
    P4 -- "Simpan Data Pembayaran" --> DS5
    P4 -- "Baca Data Booking" --> DS4
    AK -- "Keputusan Verifikasi" --> P4
    P4 -- "Update Status Booking" --> DS4
    P4 -- "Konfirmasi Verifikasi" --> JM

    %% Aliran P5 (Dokumen)
    JM -- "Foto KTP, Paspor, Nikah" --> P5
    P5 -- "Update Status Dokumen" --> DS4
    AT -- "Keputusan Verifikasi Dok" --> P5
    P5 -- "Status Dokumen" --> JM

    %% Aliran P6 (Perlengkapan)
    AP -- "Data Stok, Distribusi" --> P6
    P6 -- "Baca/Update Stok" --> DS6
    P6 -- "Laporan Stok" --> AP
    MG -- "ACC Pengajuan Barang" --> P6

    %% Aliran P7 (Keuangan)
    AK -- "Data Pemasukan / Pengeluaran" --> P7
    P7 -- "Simpan Data Keuangan" --> DS7
    P7 -- "Baca Data Pembayaran" --> DS5
    P7 -- "Laporan Keuangan" --> AK

    %% Aliran P8 (Konten)
    AT -- "Data Artikel, Gambar Banner" --> P8
    P8 -- "Simpan Konten" --> DS8
    P8 -- "Konten Publik (Blog, Promo)" --> JM
```

---

## 2. Entity Relationship Diagram (ERD)

Rancangan basis data lengkap beserta atribut dan relasi antar tabel.

```mermaid
erDiagram
    users {
        bigint id PK
        string nama
        string email UK
        string password
        enum role "jamaah|admin_travel|admin_keuangan|admin_perlengkapan|manager|agent|mitra"
        string nik
        string no_paspor
        string no_hp
        string alamat
        enum jenis_kelamin "L|P"
        date tanggal_lahir
        string tempat_lahir
        enum status_dokumen "incomplete|review|valid|rejected"
        string foto_ktp_path
        string foto_paspor_path
        string foto_buku_nikah_path
        timestamps created_at
        timestamps updated_at
    }

    paket_umroh {
        bigint id PK
        string kode_paket UK
        string nama_paket
        enum tipe "reguler|vip|vvip"
        text deskripsi
        int durasi_hari
        string maskapai
        string hotel_makkah
        string hotel_madinah
        int rating_hotel
        decimal harga
        decimal dp_minimum
        string gambar_path
        json fasilitas
        bool is_active
        timestamps created_at
    }

    jadwal {
        bigint id PK
        bigint paket_id FK
        string kode_jadwal UK
        date tanggal_berangkat
        date tanggal_pulang
        string kota_keberangkatan
        int kuota_total
        int sisa_kuota
        string maskapai
        bool is_active
        timestamps created_at
    }

    bookings {
        bigint id PK
        bigint user_id FK
        bigint jadwal_id FK
        bigint agent_id FK
        string kode_booking UK
        enum status "pending|waiting_payment|confirmed|cancelled"
        enum status_dokumen "incomplete|review|valid|rejected"
        decimal total_harga
        decimal total_dibayar
        text catatan_jamaah
        text catatan_admin
        timestamps created_at
        timestamps deleted_at
    }

    pembayaran {
        bigint id PK
        bigint booking_id FK
        bigint verified_by FK
        enum jenis_pembayaran "dp|cicilan|pelunasan|full"
        decimal nominal
        string bukti_path
        enum status_pembayaran "pending_verification|verified|rejected"
        string catatan
        datetime verified_at
        timestamps created_at
    }

    agents {
        bigint id PK
        bigint user_id FK
        string nama_agent
        string kode_agent UK
        string email
        string no_hp
        decimal komisi_persen
        bool is_active
        timestamps created_at
    }

    bonus_agent {
        bigint id PK
        bigint booking_id FK
        bigint agent_id FK
        decimal nominal_bonus
        enum status "pending|paid"
        datetime paid_at
        timestamps created_at
    }

    articles {
        bigint id PK
        bigint author_id FK
        string title
        string slug UK
        text content
        string image_path
        bool is_published
        timestamps created_at
    }

    promo_banners {
        bigint id PK
        string title
        string image_path
        bool is_active
        timestamps created_at
    }

    master_perlengkapan {
        bigint id PK
        string kode_barang UK
        string nama_barang
        string kategori
        int stok_total
        int stok_tersedia
        string satuan
        timestamps created_at
    }

    distribusi_perlengkapan {
        bigint id PK
        bigint booking_id FK
        bigint perlengkapan_id FK
        bigint distributed_by FK
        int jumlah
        enum status_penyerahan "pending|diterima"
        date tgl_penyerahan
        timestamps created_at
    }

    pengajuan_barang {
        bigint id PK
        bigint perlengkapan_id FK
        bigint requested_by FK
        bigint approved_by FK
        int jumlah_diminta
        string alasan
        enum status "pending|approved|rejected"
        timestamps created_at
    }

    pemasukan {
        bigint id PK
        bigint pembayaran_id FK
        string kategori
        decimal nominal
        text keterangan
        date tanggal
        string bukti_path
        timestamps created_at
    }

    pengeluaran {
        bigint id PK
        bigint approved_by FK
        string kategori
        decimal nominal
        text keterangan
        date tanggal
        string bukti_path
        timestamps created_at
    }

    manasik {
        bigint id PK
        bigint jadwal_id FK
        string judul_sesi
        text materi
        datetime jadwal_sesi
        string lokasi
        timestamps created_at
    }

    maskapai {
        bigint id PK
        string kode_iata UK
        string nama_maskapai
        string logo_path
        bool is_active
    }

    hotel {
        bigint id PK
        string nama_hotel
        string kota
        enum bintang "3|4|5"
        string alamat
        bool is_active
    }

    layanan {
        bigint id PK
        string nama_layanan
        text deskripsi
        decimal harga
        bool is_active
    }

    booking_layanan {
        bigint id PK
        bigint booking_id FK
        bigint layanan_id FK
        int qty
        decimal harga_satuan
    }

    %% Relasi Utama
    users ||--o{ bookings : "melakukan"
    jadwal ||--o{ bookings : "mengandung"
    paket_umroh ||--o{ jadwal : "memiliki"
    bookings ||--o{ pembayaran : "memiliki"
    agents ||--o{ bookings : "mereferensikan"
    agents ||--o{ bonus_agent : "mendapatkan"
    bookings ||--|| bonus_agent : "menghasilkan"
    users ||--o{ articles : "menulis"
    bookings ||--o{ distribusi_perlengkapan : "mendapat"
    master_perlengkapan ||--o{ distribusi_perlengkapan : "didistribusikan"
    master_perlengkapan ||--o{ pengajuan_barang : "diajukan"
    pembayaran ||--o| pemasukan : "dicatat"
    jadwal ||--o{ manasik : "memiliki"
    bookings ||--o{ booking_layanan : "memilih"
    layanan ||--o{ booking_layanan : "dipilih"
```

---

## 📋 Kamus Data (Data Dictionary)

### Tabel Utama & Penjelasan

| Tabel | Fungsi | Relasi Kunci |
|---|---|---|
| `users` | Menyimpan semua pengguna sistem (semua role) | Induk dari `bookings`, `articles` |
| `paket_umroh` | Master data paket perjalanan umroh | Induk dari `jadwal` |
| `jadwal` | Jadwal keberangkatan per paket | Induk dari `bookings`, `manasik` |
| `bookings` | Transaksi reservasi jamaah per jadwal | Pusat relasi, terhubung ke hampir semua tabel |
| `pembayaran` | Riwayat setiap transaksi pembayaran per booking | Anak dari `bookings`, sumber `pemasukan` |
| `agents` | Data mitra agen/reseller eksternal | Berelasi ke `bookings` dan `bonus_agent` |
| `promo_banners` | Gambar slider promo di halaman beranda | Standalone, dikelola admin |
| `articles` | Konten blog/berita untuk publik | `author_id` → `users.id` |
| `master_perlengkapan` | Stok perlengkapan umroh (koper, baju, dll) | Sumber `distribusi_perlengkapan` |
| `distribusi_perlengkapan` | Catatan distribusi barang ke jamaah | Junction: `bookings` ↔ `master_perlengkapan` |
| `pemasukan` | Catatan pemasukan keuangan kantor | Sumber: `pembayaran` yang verified |
| `pengeluaran` | Catatan pengeluaran / biaya operasional | Standalone, diisi admin keuangan |
| `manasik` | Sesi jadwal bimbingan ibadah per jadwal | Anak dari `jadwal` |
| `booking_layanan` | Layanan tambahan yang dipilih jamaah | Junction: `bookings` ↔ `layanan` |

### Enum Status Booking

| Status | Kondisi |
|---|---|
| `pending` | Booking baru dibuat, belum ada pembayaran |
| `waiting_payment` | Sudah ada sebagian pembayaran, belum lunas |
| `confirmed` | Pembayaran lunas & dokumen valid |
| `cancelled` | Dibatalkan oleh jamaah / sistem |

### Enum Status Dokumen

| Status | Kondisi |
|---|---|
| `incomplete` | Belum upload dokumen |
| `review` | Dokumen sudah diupload, menunggu verifikasi admin |
| `valid` | Dokumen disetujui oleh admin travel |
| `rejected` | Dokumen ditolak, jamaah harus upload ulang |
