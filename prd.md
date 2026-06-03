### **Product Requirements Document (PRD): Next.js Data Management Upgrade**

#### **1. Objektif & Visi Produk**

Meningkatkan performa, SEO, dan *Developer Experience* (DX) aplikasi dengan memigrasikannya ke Next.js. Platform ini akan menjadi pusat manajemen data yang dinamis, didukung oleh fleksibilitas MongoDB, dengan kemampuan mengumpulkan data secara instan dari sumber eksternal (Google Sheets dan *file lokal*) tanpa entri manual yang memakan waktu.

#### **2. Spesifikasi Teknologi & Infrastruktur**

Pilihan infrastruktur ini dirancang agar modern, *scalable*, dan mudah di-*maintain*:

* **Core Framework:** Next.js (App Router) dengan TypeScript.
* **Database:** MongoDB.
* **ORM / Database Client:** Prisma ORM (sangat direkomendasikan untuk *type-safety* dan migrasi yang rapi) atau Mongoose.
* **Styling:** Tailwind CSS (dipadukan dengan komponen *headless* seperti shadcn/ui untuk mempercepat *layouting*).
* **Iconography:** Lucide React untuk konsistensi visual yang bersih.
* **Integrasi Data:** Google Sheets API (via Google Cloud Service Account) untuk akses server-ke-server yang aman.
* **File Parsing:** `papaparse` (untuk parsing `.csv`) atau `xlsx` (untuk Excel).

#### **3. Fitur Utama (Core Features)**

**A. Integrasi & Sinkronisasi Google Sheets**

* **Direct Sync (Manual Trigger):** Tombol di *dashboard* untuk memicu penarikan data terbaru dari Google Sheets secara *real-time*.
* **Automated Sync (Opsional):** Menggunakan Vercel Cron Jobs atau mekanisme *scheduler* serupa untuk menarik data dari Sheets ke MongoDB setiap interval tertentu (misalnya setiap tengah malam).
* **Data Mapping:** Pemetaan otomatis antara header kolom di Google Sheets dengan *field* yang ada di dalam *collection* MongoDB.

**B. File Upload (Fallback System)**

* **Drag-and-Drop Area:** Zona khusus menggunakan Tailwind untuk menaruh file `.csv` atau `.xlsx`.
* **Data Validation:** Pengecekan tipe dan format data sebelum dimasukkan ke dalam *database* untuk menghindari anomali atau data yang *corrupt*.
* **Preview Modal:** Menampilkan pratinjau 5 baris pertama data yang diunggah sebelum pengguna mengonfirmasi proses *import* ke MongoDB.

**C. Data Management Dashboard**

* Tabel interaktif untuk menampilkan data yang telah berhasil masuk (dilengkapi dengan *pagination*, *search*, dan *sorting*).
* Indikator status sinkronisasi terakhir (contoh: "Terakhir disinkronkan: 25 Mei, 08:00 WIB").

#### **4. Rencana Arsitektur Direktori**

Struktur kode akan difokuskan pada pemisahan logika UI dan *server actions*:

* `app/api/sync/route.ts`: Endpoint khusus untuk mengeksekusi koneksi ke Google Sheets API dan melakukan proses *upsert* (update/insert) ke MongoDB.
* `app/components/ui/`: Direktori untuk komponen *reusable* seperti tombol sinkronisasi, modal konfirmasi, dan tabel data (menggunakan Tailwind & Lucide).
* `prisma/schema.prisma`: Mendefinisikan model data untuk memetakan kolom dari sumber eksternal secara terstruktur.

#### **5. Fase Implementasi (Roadmap)**

**Fase 1: Pengembangan Frontend (UI/UX & Komponen)**
Fokus utama pada fase ini adalah membangun seluruh antarmuka pengguna, komponen visual, dan *mockup* interaksi tanpa perlu memikirkan logika *database* terlebih dahulu.

* **Inisialisasi Project:** Setup Next.js (App Router) dipadukan dengan Tailwind CSS.
* **Sistem Desain & Ikon:** Konfigurasi komponen UI (bisa menggunakan pendekatan *headless* seperti shadcn/ui) dan integrasi ikon menggunakan Lucide React.
* **Dashboard & Layouting:** Membangun halaman *dashboard* utama yang berisi tabel data interaktif (*mock data* sementara), lengkap dengan elemen desain untuk *pagination*, *search*, dan *sorting*.
* **Interface Integrasi Data:** * Membangun komponen tombol "Sync Google Sheets" dengan *loading state*.
* Membuat area *Drag-and-Drop* untuk *upload* file.
* Membuat desain *Modal/Dialog* untuk pratinjau data sebelum *import* final dilakukan.



**Fase 2: Pengembangan Backend (Infrastruktur Data & API)**
Setelah UI siap, fase ini difokuskan murni pada logika *server-side*, koneksi *database*, dan pemrosesan data.

* **Database Setup:** Konfigurasi koneksi ke MongoDB dan mendefinisikan skema data secara presisi menggunakan Prisma ORM.
* **Integrasi API Eksternal:** Konfigurasi Google Cloud Service Account dan menyusun fungsi utilitas untuk berkomunikasi dengan Google Sheets API secara aman.
* **Pemrosesan File:** Mengimplementasikan *library* (seperti `papaparse` atau `xlsx`) di sisi *server* untuk membaca dan mengekstrak data dari *file upload*.
* **API Routes (Next.js):** Membangun *endpoint* di `app/api/...` untuk:
* Mengeksekusi *pull* data dari Sheets.
* Menerima data *file upload* dari *client*.
* Menjalankan logika validasi data dan operasi *bulk upsert* (update/insert) ke dalam MongoDB.



**Fase 3: Integrasi (Frontend + Backend)**

* Menyambungkan komponen UI dari Fase 1 dengan API Routes dari Fase 2.
* Mengganti *mock data* di tabel *dashboard* dengan data asli dari MongoDB.
* Implementasi penanganan *error* (misalnya jika API Google Sheets *limit* atau *file upload corrupt*) dan menampilkan notifikasi yang jelas ke pengguna.

**Fase 4: Testing & Finalisasi**

* Melakukan uji coba beban (*stress test* ringan) saat melakukan *import* ribuan baris data.
* Pengecekan keamanan API (memastikan *endpoint import* tidak bisa diakses sembarangan).
* Persiapan *deployment* (seperti Vercel) dan *setting environment variables* untuk *production*.