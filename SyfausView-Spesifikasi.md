# Spesifikasi Proyek: SyfausView

## 1. Gambaran Umum
SyfausView adalah platform berbagi konten visual (gambar dan video) berbasis web yang mengutamakan keaslian kualitas media. Platform ini memungkinkan pengguna terdaftar untuk mengunggah, mengelola, dan membagikan konten mereka sendiri dengan jaminan bahwa kualitas asli, rasio aspek, dan audio video tetap terjaga tanpa kompresi yang merusak.

## 2. Fitur Utama (Core Features)

### A. Manajemen Akun Pengguna (User Authentication)
- **Registrasi Mandiri**: Pengguna dapat membuat akun baru secara independen.
  - Data yang dibutuhkan: Username, Email, Password.
- **Login**: Akses masuk menggunakan kredensial yang telah dibuat.
- **Logout**: Fitur keluar dari akun dengan aman.

### B. Profil Pengguna
- **Foto Profil Kustom**: Pengguna dapat mengunggah foto dari perangkat mereka (file lokal) untuk dijadikan foto profil.
- **Penyimpanan**: Foto profil disimpan di server dan ditampilkan di setiap konten yang dibagikan oleh pengguna tersebut.

### C. Unggah Konten (Upload)
- **Dukungan Format**:
  - Gambar: JPG, PNG, WEBP, dll.
  - Video: MP4, MOV, AVI, dll.
- **Sumber File**: Diambil langsung dari penyimpanan perangkat pengguna (File Picker).
- **Integritas File**:
  - Gambar: Ditampilkan sesuai resolusi dan rasio aspek asli (tidak di-crop otomatis, tidak di-compress berlebihan).
  - Video: Ditampilkan sesuai resolusi dan rasio aspek asli.

### D. Manajemen Konten (CRUD)
- **Create (Buat)**: Mengunggah foto/video ke feed website.
- **Read (Baca/Lihat)**: Melihat konten milik sendiri dan orang lain.
- **Delete (Hapus)**: Pengguna memiliki hak penuh untuk menghapus konten yang mereka unggah sebelumnya dari website.

## 3. Spesifikasi Teknis Media (Penting)

### A. Spesifikasi Video
- **Durasi (Validasi Waktu)**:
  - Minimal: 2 Detik.
  - Maksimal: 3 Menit (180 Detik).
  - Sistem harus menolak file video di luar rentang waktu ini saat proses upload.
- **Audio**:
  - Wajib Ada Suara: File video tidak boleh dimute atau dihilangkan track audionya saat diputar di website.
  - Player video harus mendukung output suara default.
- **Kualitas & Rasio**:
  - Aspect Ratio: Harus tetap utuh (misal: video vertikal 9:16 tetap vertikal, video landscape 16:9 tetap landscape). Tidak ada pemaksaan menjadi kotak.
  - Resolusi: Tidak ada downscale (pengecilan resolusi) yang signifikan yang merusak ketajaman.

### B. Spesifikasi Gambar
- **Kualitas**: Gambar ditampilkan setajam aslinya.
- **Rasio**: Tidak ada cropping otomatis. Jika gambar memanjang atau lebar, tampilan website harus menyesuaikan (responsive) tanpa memotong bagian gambar.

## 4. Alur Pengguna (User Flow)
1. **Kunjungan Awal**: User membuka SyfausView.
2. **Pendaftaran**: User klik \"Daftar\", isi data, dan akun tercipta.
3. **Setup Profil**: User masuk ke pengaturan profil -> Upload foto dari galeri -> Simpan.
4. **Unggah Konten**:
   - User klik tombol \"Upload\".
   - Pilih file (Foto/Video).
   - Sistem melakukan pengecekan otomatis: (Apakah video > 2 detik? Apakah < 3 menit?).
   - Jika lolos, file diunggah ke server.
5. **Tampilan**: Konten muncul di beranda/feed dengan kualitas asli.
6. **Penghapusan**: User melihat konten mereka, klik opsi \"Hapus\", konfirmasi, dan konten hilang dari server.

## 5. Rekomendasi Teknologi (Tech Stack)
Untuk mencapai fitur \"Video utuh, suara ada, durasi pas\", berikut rekomendasi teknisnya:

### Frontend (Tampilan):
- HTML5 & CSS3 (untuk mengatur rasio aspek menggunakan properti object-fit: contain agar gambar/video tidak terpotong).
- JavaScript (untuk validasi awal durasi video sebelum upload agar hemat bandwidth).

### Backend (Server):
- Bahasa: Node.js, PHP (Laravel), atau Python (Django/Flask).
- **Penting**: Diperlukan library pemroses video seperti FFmpeg di server. FFmpeg digunakan untuk:
  - Memastikan durasi video akurat (2s - 3m).
  - Memastikan stream audio tidak dibuang saat penyimpanan.

### Database:
- MySQL atau PostgreSQL (untuk menyimpan data user, link file, dan waktu upload).

### Penyimpanan File (Storage):
- Disarankan menggunakan Object Storage (seperti AWS S3, Cloudinary, atau Firebase Storage) agar file video berat tidak membebani server utama dan tetap cepat diakses.

## 6. Struktur Database Sederhana
Untuk mendukung fitur di atas, database minimal membutuhkan tabel berikut:

### Tabel users
- `id` (Primary Key)
- `username`
- `email`
- `password_hash`
- `profile_picture_path` (Lokasi file foto profil)
- `created_at`

### Tabel posts (Konten)
- `id` (Primary Key)
- `user_id` (Foreign Key ke tabel users)
- `file_path` (Lokasi file video/foto)
- `file_type` (Video/Image)
- `duration` (Khusus video, untuk menyimpan durasi detik)
- `created_at`

## Catatan Penting untuk Developer:
- **Masalah Umum**: Banyak website otomatis meng-compress video untuk menghemat ruang, yang seringkali menghilangkan suara atau membuat video pecah.
- **Solusi SyfausView**: Instruksikan developer untuk menyimpan file sebagai \"Original File\" atau menggunakan kompresi lossless jika sangat diperlukan, serta memastikan tag HTML `<video>` tidak memiliki atribut `muted`.
