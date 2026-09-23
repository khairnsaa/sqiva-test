# Sqi Market - Menu Management Mini App

> **Technical Test - Frontend Engineer**

---

## 📌 Deskripsi Proyek

Aplikasi web **Menu Management ("Sqi Market")** adalah mini aplikasi katalog makanan dan sistem pemesanan interaktif (Order Table) yang dibangun berdasarkan lembar studi kasus technical test. Aplikasi ini mengonsumsi API eksternal secara asinkronus (`async/await`), menyajikan data ke dalam layout **CSS Grid** yang responsif, mendukung operasi CRUD (Create, Read, Update, Delete) menu, pencarian dengan **debounce 500 ms**, serta simulasi keranjang belanja dengan sinkronisasi stok secara real-time.

---

## 🛠️ Teknologi yang Digunakan

- **HTML5**: Elemen semantik (`header`, `section`, `main`, `aside`, `article`, `table`).
- **Vanilla CSS3**:
  - CSS Grid Layout (`grid-template-columns`, `gap: 16px`).
  - CSS Custom Properties / Variables untuk palet warna konsisten.
  - Flexbox untuk layout komponen mikro.
  - Media Queries untuk responsivitas multi-device.
  - Keyframe animations & glassmorphism backdrop filter.
- **Vanilla JavaScript (ES6+)**:
  - `async/await` & Fetch API.
  - Functional programming (`map`, `filter`, `reduce`, `sort`).
  - Debounce pattern (500 ms).
  - Centralized state management & event delegation.
- **Tanpa Dependency Eksternal**: Bebas dari Bootstrap, TailwindCSS, React, Vue, jQuery, atau library eksternal lainnya.

---

## 🚀 Fitur & Pemenuhan Persyaratan Soal

Berikut adalah rincian pemenuhan seluruh butir spesifikasi teknis:

### 1. Konsumsi API Asinkronus (`async/await`)

- Mengambil data dari endpoint API: `https://my-json-server.typicode.com/sqiva-sistem/sqiva-dummy/menus` menggunakan sintaks modern `async/await`.
- Dilengkapi mekanisme **graceful fallback** ke data dummy mock jika terjadi kegagalan jaringan atau API mengalami kendala.

### 2. Transformasi Data Sebelum Ditampilkan

- **Kategori Khusus**: Hanya menampilkan menu dengan kategori **`Food`** saat transformasi data awal.
- **Properti `isLowStock`**: Menambahkan properti boolean `isLowStock` (`true` jika `stock < 3`, dan `false` jika sebaliknya).
- **Pengurutan Data**: Data diurutkan dari **harga tertinggi ke harga terendah** (`sort((a, b) => b.price - a.price)`).
- **Fallback Gambar**: Penanganan otomatis foto fallback jika URL gambar tidak valid atau gagal dimuat.

### 3. Layout Responsif Menggunakan CSS Grid

Tampilan responsif murni menggunakan **CSS Grid** dan media queries dengan jarak antar card (_gap_) tepat **16px**:

- **Desktop (`> 1024px`)**: 4 kolom
- **Tablet (`600px - 1024px`)**: 2 kolom
- **Mobile (`< 600px`)**: 1 kolom

### 4. Komponen Card Menu Lengkap

Setiap card menu menyajikan informasi lengkap:

- Foto / Gambar Menu
- Nama Menu
- Badge Kategori Menu (`Food` / `Drink`)
- Harga Menu (format Rupiah Indonesia: `Rp xx.xxx`)
- Jumlah Stok & Badge Status Stok
- Tombol Aksi: **Add to cart**, **Edit**, dan **Delete**

### 5. Status Badge Stok (`Low Stock` & `Normal`)

- Jika `isLowStock === true` (`stock < 3`): Menampilkan badge berwarna oranye/kuning bertuliskan **`Low Stock`**.
- Jika `isLowStock === false` (`stock >= 3`): Menampilkan badge berwarna hijau bertuliskan **`Normal`**.
- **Real-time Status Update**: Jika menu berstok 3 ditambahkan ke pesanan sehingga stoknya menjadi 2, badge pada card tersebut **otomatis berubah dari `Normal` menjadi `Low Stock`**.
- Jika stok habis (`stock === 0`), tombol _Add to cart_ dinonaktifkan (`disabled`) dan teks menampilkan keterangan stok habis.

### 6 & 7. Form Tambah Menu & Validasi Input

Modal popup formulir tambah menu baru dan edit menu dengan validasi ketat pada sisi klien (_client-side_):

- **Nama Menu**: Wajib diisi (tidak boleh kosong atau hanya spasi).
- **Kategori**: Wajib dipilih (`Food` / `Drink`).
- **Harga**: Wajib diisi dan **lebih dari 0** (`price > 0`).
- **Stock**: Wajib diisi, **lebih dari 0**, dan tidak boleh bernilai negatif (`stock > 0` dan bilangan bulat).
- URL Gambar opsional dengan live photo preview sebelum disimpan.

### 8. Fitur Tambah ke Pesanan (Order Table) & Fungsi `calculateTotal(order)`

- Menambahkan menu ke daftar pesanan (_Order Table_).
- Jika menu sudah ada di dalam pesanan, jumlah kuantitas (_quantity_) bertambah.
- Menu tidak dapat ditambahkan jika stok sudah habis.
- Menampilkan ringkasan pesanan: daftar item, total kuantitas item, dan total harga belanja.
- Terdapat stepper `+` dan `-` untuk menyesuaikan kuantitas pesanan:
  - Mengurangi kuantitas mengembalikan stok ke menu.
  - Mengosongkan pesanan atau menghapus baris pesanan mengembalikan seluruh stok kembali ke katalog.
- **Fungsi `calculateTotal(order)`**:
  Fungsi murni (_pure function_) yang menerima array `order` dan mengembalikan nilai total harga belanja:
  ```javascript
  function calculateTotal(order) {
    if (!Array.isArray(order)) return 0;
    return order.reduce((total, item) => {
      const price = Number(item.price) || 0;
      const qty = Number(item.qty) || 0;
      return total + price * qty;
    }, 0);
  }
  ```
- Tombol **Checkout Pesanan** untuk menyelesaikan transaksi dan mereset pesanan.

### 9. Pencarian Menu dengan Debounce 500 ms

- Input pencarian nama menu dilengkapi fungsi utility `debounce` dengan waktu tunda **500 ms**.
- Mengoptimalkan performa rendering dengan menahan proses filter hingga pengguna selesai mengetik.
  ```javascript
  function debounce(func, delay = 500) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  }
  ```

---

## 📁 Struktur Direktori

```text
sqiva/
├── index.html        # Struktur semantik HTML5, toolbar kontrol, grid menu, order table, & modal dialog
├── style.css         # Desain sistem Vanilla CSS, CSS Grid, variabel warna, media queries, & animations
├── main.js           # Logika aplikasi ES6+, async/await fetch, state management, debounce, CRUD, & cart
└── README.md         # Dokumentasi teknis proyek
```

---

## 💻 Cara Menjalankan Aplikasi

Aplikasi ini bersifat murni statis (_zero dependencies_ / tidak memerlukan `npm install`):

### Opsi 1: Buka Langsung di Browser

Cukup klik dua kali (atau _drag & drop_) file `index.html` ke browser favorit Anda (Google Chrome, Microsoft Edge, Mozilla Firefox, Safari).

### Opsi 2: Menggunakan Local Development Server

Jika ingin menjalankan melalui local server:

**Menggunakan Python:**

```bash
python -m http.server 8080
```

Buka browser pada alamat: [http://localhost:8080](http://localhost:8080)

**Menggunakan Node.js (npx serve / live-server):**

```bash
npx serve .
```

---

## 🧪 Validasi & Pengujian

Aplikasi telah divalidasi dan diuji:

- [x] Syntax check Node.js valid tanpa error.
- [x] Fungsi `calculateTotal(order)` menghasilkan nilai akurat dengan array order multi-item.
- [x] Logika `isLowStock` otomatis menentukan badge `Low Stock` (< 3) vs `Normal` (>= 3).
- [x] Pemanggilan API `sqiva-sistem` berhasil memuat data dan terfilter hanya menu `Food` dengan urutan harga tertinggi ke terendah.
- [x] Breakpoint CSS Grid teruji di viewport desktop, tablet, dan mobile.
- [x] Validasi form menolak submit jika input kosong, harga <= 0, atau stok <= 0.
