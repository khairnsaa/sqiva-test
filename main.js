/**
 * Sqi Market - Menu Management System
 * Vanilla JavaScript (ES6+) with Async/Await, Debounce, Realtime Stock Sync,
 * and calculateTotal(order) Function.
 */

// API Endpoint specification (sqiva-sistem)
const API_URL =
  "https://my-json-server.typicode.com/sqiva-sistem/sqiva-dummy/menus";

// Fallback Default Data (as specified in coding test case)
const DEFAULT_FALLBACK_MENUS = [
  {
    id: 1,
    name: "Nasi Goreng Singapore",
    category: "Food",
    price: 25000,
    stock: 3,
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 2,
    name: "Mie Ayam Wonogiri",
    category: "Food",
    price: 18000,
    stock: 10,
    image:
      "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 3,
    name: "Es Teh",
    category: "Drink",
    price: 5000,
    stock: 20,
    image:
      "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 4,
    name: "Jus Alpukat",
    category: "Drink",
    price: 15000,
    stock: 2,
    image:
      "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 5,
    name: "Ayam Bakar",
    category: "Food",
    price: 30000,
    stock: 5,
    image:
      "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=600&q=80",
  },
];

const DEFAULT_IMAGE_FOOD =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80";
const DEFAULT_IMAGE_DRINK =
  "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80";

// Global Application State
const state = {
  menus: [], // Array of menu items
  cart: [], // Array of order items { menuId, name, price, qty }
  searchTerm: "", // Current search string
  categoryFilter: "ALL",
  stockFilter: "ALL",
  pendingDeleteId: null, // Id of menu pending deletion
};

// DOM Element References
const elements = {
  // Badges
  menuCountBadge: document.getElementById("menuCountBadge"),
  filterIndicator: document.getElementById("filterIndicator"),
  mobileCartCount: document.getElementById("mobileCartCount"),
  orderItemCountBadge: document.getElementById("orderItemCountBadge"),

  // Controls
  searchInput: document.getElementById("searchInput"),
  clearSearchBtn: document.getElementById("clearSearchBtn"),
  categoryFilter: document.getElementById("categoryFilter"),
  stockFilter: document.getElementById("stockFilter"),
  openAddModalBtn: document.getElementById("openAddModalBtn"),
  mobileCartBtn: document.getElementById("mobileCartBtn"),
  orderSidebar: document.getElementById("orderSidebar"),
  resetFiltersBtn: document.getElementById("resetFiltersBtn"),

  // Containers
  menuGrid: document.getElementById("menuGrid"),
  emptyState: document.getElementById("emptyState"),
  orderTableBody: document.getElementById("orderTableBody"),
  emptyCartMessage: document.getElementById("emptyCartMessage"),
  summaryTotalQty: document.getElementById("summaryTotalQty"),
  summaryTotalPrice: document.getElementById("summaryTotalPrice"),
  clearCartBtn: document.getElementById("clearCartBtn"),
  checkoutBtn: document.getElementById("checkoutBtn"),
  toastContainer: document.getElementById("toastContainer"),

  // Form Modal
  menuModal: document.getElementById("menuModal"),
  modalTitle: document.getElementById("modalTitle"),
  menuForm: document.getElementById("menuForm"),
  menuId: document.getElementById("menuId"),
  menuName: document.getElementById("menuName"),
  menuCategory: document.getElementById("menuCategory"),
  menuPrice: document.getElementById("menuPrice"),
  menuStock: document.getElementById("menuStock"),
  menuImage: document.getElementById("menuImage"),
  imagePreview: document.getElementById("imagePreview"),
  closeModalBtn: document.getElementById("closeModalBtn"),
  cancelModalBtn: document.getElementById("cancelModalBtn"),

  // Delete Confirmation Modal
  confirmDeleteModal: document.getElementById("confirmDeleteModal"),
  deleteMenuName: document.getElementById("deleteMenuName"),
  confirmDeleteBtn: document.getElementById("confirmDeleteBtn"),
  cancelDeleteBtn: document.getElementById("cancelDeleteBtn"),
  closeDeleteModalBtn: document.getElementById("closeDeleteModalBtn"),
};

// ==========================================================================
// Poin 8: Fungsi calculateTotal(order) untuk Menghitung Total Harga
// ==========================================================================

/**
 * Poin 8: Buat fungsi calculateTotal(order) untuk menghitung total harga
 * @param {Array} order - Array item pesanan [{ menuId, name, price, qty }]
 * @returns {number} Total harga belanja
 */
function calculateTotal(order) {
  if (!Array.isArray(order)) return 0;
  return order.reduce((total, item) => {
    const price = Number(item.price) || 0;
    const qty = Number(item.qty) || 0;
    return total + price * qty;
  }, 0);
}

// Expose secara global agar dapat diuji oleh unit test jika ada
window.calculateTotal = calculateTotal;

// ==========================================================================
// Poin 9: Debounce 500 ms untuk Pencarian Nama Menu
// ==========================================================================

/**
 * Poin 9: Utility debounce function
 * Menunda eksekusi fungsi hingga delay ms berlalu tanpa pemanggilan baru
 * @param {Function} func - Fungsi yang akan dieksekusi
 * @param {number} delay - Waktu tunda dalam milidetik (default: 500ms)
 */
function debounce(func, delay = 500) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

// ==========================================================================
// Formatting Helpers
// ==========================================================================

/**
 * Format number into Indonesian Rupiah (Rp xx.xxx)
 */
function formatRupiah(number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number);
}

/**
 * Escape HTML to prevent XSS injection
 */
function escapeHtml(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ==========================================================================
// Toast Notification System
// ==========================================================================

function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;

  const iconSvg =
    type === "danger"
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`
      : type === "warning"
        ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`
        : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`;

  toast.innerHTML = `${iconSvg}<span>${escapeHtml(message)}</span>`;
  elements.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "toastSlideOut 0.3s ease forwards";
    setTimeout(() => toast.remove(), 300);
  }, 2800);
}

// ==========================================================================
// Poin 2: Data Transformation & Initialization
// ==========================================================================

/**
 * Poin 2: Transform raw menu item:
 * - Tambahkan properti isLowStock (true jika stock dibawah 3)
 * - Tentukan status: isLowStock ? 'Low Stock' : 'Normal'
 * - Ensure image URL fallback
 */
function transformMenuItem(item) {
  const stockNum = parseInt(item.stock, 10) || 0;
  const isLowStock = stockNum < 3; // Poin 2: isLowStock true jika stock dibawah 3

  let imageUrl =
    item.image && item.image.trim() !== "" ? item.image.trim() : null;

  if (!imageUrl) {
    imageUrl =
      item.category === "Drink" ? DEFAULT_IMAGE_DRINK : DEFAULT_IMAGE_FOOD;
  }

  return {
    id: item.id,
    name: item.name,
    category: item.category || "Food",
    price: parseInt(item.price, 10) || 0,
    stock: Math.max(0, stockNum),
    isLowStock: isLowStock,
    status: isLowStock ? "Low Stock" : "Normal",
    image: imageUrl,
  };
}

/**
 * Fetch data from API with async/await, fallback to dummy data on error.
 * Poin 2:
 * 1. Tampilkan hanya menu dengan kategori Food.
 * 2. Tambahkan properti isLowStock (true jika stock dibawah 3).
 * 3. Urutkan data berdasarkan harga tertinggi ke harga terendah.
 */
async function fetchMenuData() {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`API HTTP Error: ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("API returned invalid or empty array");
    }

    // Poin 2: Filter hanya menu Food, transformasi isLowStock, urutkan harga tertinggi ke terendah
    state.menus = data
      .filter((item) => (item.category || "").toLowerCase() === "food")
      .map(transformMenuItem)
      .sort((a, b) => b.price - a.price);

    showToast("Data menu Food berhasil dimuat dari API", "success");
  } catch (error) {
    console.warn("API Fetching encountered an issue:", error.message);
    console.info("Switching to default fallback menu data as specified.");

    // Fallback: Filter hanya menu Food, transformasi isLowStock, urutkan harga tertinggi ke terendah
    state.menus = DEFAULT_FALLBACK_MENUS
      .filter((item) => (item.category || "").toLowerCase() === "food")
      .map(transformMenuItem)
      .sort((a, b) => b.price - a.price);

    showToast("Menggunakan data dummy (Fallback API)", "warning");
  }

  renderMenuGrid();
  renderOrderTable();
}

// ==========================================================================
// Filter & Search Engine
// ==========================================================================

function getFilteredMenus() {
  return state.menus.filter((menu) => {
    // Search filter
    const matchesSearch = menu.name
      .toLowerCase()
      .includes(state.searchTerm.toLowerCase());

    // Category filter
    const matchesCategory =
      state.categoryFilter === "ALL" || menu.category === state.categoryFilter;

    // Stock filter
    let matchesStock = true;
    if (state.stockFilter === "IN_STOCK") {
      matchesStock = menu.stock > 0;
    } else if (state.stockFilter === "SOLD_OUT") {
      matchesStock = menu.stock === 0;
    }

    return matchesSearch && matchesCategory && matchesStock;
  });
}

// ==========================================================================
// Poin 3, 4, 5: Rendering CSS Grid Menu Cards & Badges
// ==========================================================================

function renderMenuGrid() {
  const filteredMenus = getFilteredMenus();

  // Update counter badges
  elements.menuCountBadge.textContent = `${filteredMenus.length} dari ${state.menus.length} menu`;

  // Filter indicator text
  const activeFilters = [];
  if (state.searchTerm) activeFilters.push(`Pencarian: "${state.searchTerm}"`);
  if (state.categoryFilter !== "ALL")
    activeFilters.push(`Kategori: ${state.categoryFilter}`);
  if (state.stockFilter !== "ALL")
    activeFilters.push(
      `Stok: ${state.stockFilter === "IN_STOCK" ? "In Stock" : "Sold Out"}`
    );

  elements.filterIndicator.textContent = activeFilters.join(" • ");

  // Empty state handling
  if (filteredMenus.length === 0) {
    elements.menuGrid.innerHTML = "";
    elements.emptyState.classList.remove("hidden");
    return;
  }

  elements.emptyState.classList.add("hidden");

  // Render cards into CSS Grid (Poin 3, 4, 5)
  elements.menuGrid.innerHTML = filteredMenus
    .map((menu) => {
      const isSoldOut = menu.stock <= 0;
      // Poin 5: Jika isLowStock bernilai true, tampilkan badge Low Stock, jika tidak tampilkan Normal
      const isLow = menu.stock < 3;
      const statusClass = isSoldOut
        ? "sold-out"
        : isLow
          ? "low-stock"
          : "normal";
      const statusLabel = isSoldOut
        ? "Sold Out"
        : isLow
          ? "Low Stock"
          : "Normal";

      const categoryClass = menu.category
        ? menu.category.toLowerCase()
        : "food";

      return `
      <article class="menu-card" data-id="${menu.id}">
        <!-- Card Image & Badges -->
        <div class="card-image-wrap">
          <img 
            src="${escapeHtml(menu.image)}" 
            alt="${escapeHtml(menu.name)}"
            loading="lazy"
            onerror="this.onerror=null; this.src='${menu.category === "Drink" ? DEFAULT_IMAGE_DRINK : DEFAULT_IMAGE_FOOD}';" 
          />
          <span class="category-pill ${categoryClass}">${escapeHtml(menu.category)}</span>
          <span class="status-pill ${statusClass}">${statusLabel}</span>
        </div>

        <!-- Card Body (Poin 4: Nama, Kategori, Harga, Stock, Status Stock, Tombol Add, Edit, Delete) -->
        <div class="card-content">
          <div class="card-title-row">
            <h3 class="card-title" title="${escapeHtml(menu.name)}">${escapeHtml(menu.name)}</h3>
          </div>

          <div class="card-details">
            <span class="card-price">${formatRupiah(menu.price)}</span>
            <span class="card-stock">
              ${isSoldOut ? '<span style="color: var(--danger); font-weight:700;">Habis</span>' : `Stok: <strong>${menu.stock}</strong>`}
            </span>
          </div>

          <!-- Card Actions (Poin 4: Tombol Add, Edit, dan Delete) -->
          <div class="card-actions">
            <button 
              type="button"
              class="btn-card btn-card-add" 
              onclick="handleAddToCart(${menu.id})"
              ${isSoldOut ? 'disabled title="Stok habis"' : 'title="Tambah ke pesanan"'}
            >
              <span>Add to cart</span>
            </button>

            <button 
              type="button"
              class="btn-card btn-card-edit" 
              onclick="handleOpenEditModal(${menu.id})"
              title="Edit menu"
            >
              <span>Edit</span>
            </button>

            <button 
              type="button"
              class="btn-card btn-card-delete" 
              onclick="handleOpenDeleteModal(${menu.id})"
              title="Hapus menu"
            >
              <span>Delete</span>
            </button>
          </div>
        </div>
      </article>
    `;
    })
    .join("");
}

// ==========================================================================
// Poin 8: Tambah ke Pesanan & Shopping Cart Management
// ==========================================================================

/**
 * Poin 8: Fitur Tambah ke Pesanan
 * - Menu masuk ke daftar pesanan.
 * - Jika menu sudah ada, quantity bertambah.
 * - Jika stock habis, menu tidak dapat ditambahkan.
 */
function handleAddToCart(menuId) {
  const menu = state.menus.find((m) => m.id === menuId);

  if (!menu) return;

  if (menu.stock <= 0) {
    showToast(`Stok ${menu.name} sudah habis!`, "danger");
    return;
  }

  // Kurangi stok menu
  menu.stock -= 1;
  menu.isLowStock = menu.stock < 3;
  menu.status = menu.isLowStock ? "Low Stock" : "Normal";

  // Check jika menu sudah ada di pesanan
  const cartItem = state.cart.find((c) => c.menuId === menuId);

  if (cartItem) {
    cartItem.qty += 1;
  } else {
    state.cart.push({
      menuId: menu.id,
      name: menu.name,
      price: menu.price,
      qty: 1,
    });
  }

  showToast(`${menu.name} ditambahkan ke Order Table`, "success");

  renderMenuGrid();
  renderOrderTable();
}

/**
 * Tambah quantity pesanan (kurangi stok menu)
 */
function handleCartIncrease(menuId) {
  const menu = state.menus.find((m) => m.id === menuId);
  const cartItem = state.cart.find((c) => c.menuId === menuId);

  if (!cartItem) return;

  if (!menu || menu.stock <= 0) {
    showToast(`Stok ${cartItem.name} sudah tidak mencukupi`, "warning");
    return;
  }

  menu.stock -= 1;
  menu.isLowStock = menu.stock < 3;
  menu.status = menu.isLowStock ? "Low Stock" : "Normal";
  cartItem.qty += 1;

  renderMenuGrid();
  renderOrderTable();
}

/**
 * Kurangi quantity pesanan (kembalikan stok ke menu)
 */
function handleCartDecrease(menuId) {
  const menu = state.menus.find((m) => m.id === menuId);
  const cartIndex = state.cart.findIndex((c) => c.menuId === menuId);

  if (cartIndex === -1) return;

  const cartItem = state.cart[cartIndex];

  if (menu) {
    menu.stock += 1;
    menu.isLowStock = menu.stock < 3;
    menu.status = menu.isLowStock ? "Low Stock" : "Normal";
  }

  cartItem.qty -= 1;

  if (cartItem.qty <= 0) {
    state.cart.splice(cartIndex, 1);
    showToast(`${cartItem.name} dihapus dari Order Table`, "warning");
  }

  renderMenuGrid();
  renderOrderTable();
}

/**
 * Hapus baris menu dari pesanan (kembalikan seluruh stok)
 */
function handleCartRemoveItem(menuId) {
  const cartIndex = state.cart.findIndex((c) => c.menuId === menuId);
  if (cartIndex === -1) return;

  const cartItem = state.cart[cartIndex];
  const menu = state.menus.find((m) => m.id === menuId);

  if (menu) {
    menu.stock += cartItem.qty;
    menu.isLowStock = menu.stock < 3;
    menu.status = menu.isLowStock ? "Low Stock" : "Normal";
  }

  state.cart.splice(cartIndex, 1);
  showToast(`${cartItem.name} dihapus dari keranjang`, "warning");

  renderMenuGrid();
  renderOrderTable();
}

/**
 * Kosongkan seluruh pesanan dan kembalikan stok
 */
function handleClearCart() {
  if (state.cart.length === 0) return;

  state.cart.forEach((item) => {
    const menu = state.menus.find((m) => m.id === item.menuId);
    if (menu) {
      menu.stock += item.qty;
      menu.isLowStock = menu.stock < 3;
      menu.status = menu.isLowStock ? "Low Stock" : "Normal";
    }
  });

  state.cart = [];
  showToast("Order Table telah dikosongkan", "warning");

  renderMenuGrid();
  renderOrderTable();
}

/**
 * Checkout pesanan (menghitung total harga menggunakan calculateTotal)
 */
function handleCheckout() {
  if (state.cart.length === 0) return;

  const totalQty = state.cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = calculateTotal(state.cart); // Poin 8: Menggunakan fungsi calculateTotal

  alert(
    `Pesanan Berhasil Diproses!\n\nJumlah Item: ${totalQty}\nTotal Pembayaran: ${formatRupiah(totalPrice)}\n\nTerima kasih telah memesan di Sqi Market!`
  );

  state.cart = [];
  showToast("Pesanan berhasil dibuat!", "success");

  renderMenuGrid();
  renderOrderTable();
}

/**
 * Render Order Table, summary, dan hitung total menggunakan calculateTotal(state.cart)
 */
function renderOrderTable() {
  const totalItems = state.cart.reduce((sum, item) => sum + item.qty, 0);
  // Poin 8: Buat fungsi calculateTotal(order) untuk menghitung total harga
  const totalPrice = calculateTotal(state.cart);

  // Update badges
  elements.mobileCartCount.textContent = totalItems;
  elements.orderItemCountBadge.textContent = `${totalItems} item`;
  elements.summaryTotalQty.textContent = totalItems;
  elements.summaryTotalPrice.textContent = formatRupiah(totalPrice);

  const hasItems = state.cart.length > 0;
  elements.clearCartBtn.disabled = !hasItems;
  elements.checkoutBtn.disabled = !hasItems;

  if (!hasItems) {
    elements.orderTableBody.innerHTML = "";
    elements.emptyCartMessage.classList.remove("hidden");
    return;
  }

  elements.emptyCartMessage.classList.add("hidden");

  elements.orderTableBody.innerHTML = state.cart
    .map((item) => {
      const subtotal = item.qty * item.price;
      const menu = state.menus.find((m) => m.id === item.menuId);
      const isStockExhausted = !menu || menu.stock <= 0;

      return `
      <tr>
        <td class="col-menu">
          <span class="order-item-name">${escapeHtml(item.name)}</span>
          <span class="order-item-price">${formatRupiah(item.price)}</span>
        </td>
        <td class="col-qty text-center">
          <div class="qty-stepper">
            <button 
              type="button" 
              class="qty-btn" 
              onclick="handleCartDecrease(${item.menuId})" 
              aria-label="Kurangi jumlah"
            >-</button>
            <span class="qty-value">${item.qty}</span>
            <button 
              type="button" 
              class="qty-btn" 
              onclick="handleCartIncrease(${item.menuId})" 
              ${isStockExhausted ? 'disabled title="Stok habis"' : 'title="Tambah jumlah"'}
              aria-label="Tambah jumlah"
            >+</button>
          </div>
        </td>
        <td class="col-total text-right">
          <strong>${formatRupiah(subtotal)}</strong>
        </td>
        <td class="col-action text-center">
          <button 
            type="button" 
            class="btn-remove-item" 
            onclick="handleCartRemoveItem(${item.menuId})" 
            title="Hapus dari pesanan"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </td>
      </tr>
    `;
    })
    .join("");
}

// ==========================================================================
// Modal Management (Poin 6 & 7: Form Tambah & Edit Menu + Validasi)
// ==========================================================================

function openAddMenuModal() {
  elements.modalTitle.textContent = "Tambah Menu Baru";
  elements.menuId.value = "";
  elements.menuForm.reset();
  elements.menuCategory.value = "Food"; // Default to Food
  clearFormValidation();

  elements.imagePreview.src = DEFAULT_IMAGE_FOOD;

  elements.menuModal.classList.add("active");
  elements.menuModal.setAttribute("aria-hidden", "false");
  elements.menuName.focus();
}

function handleOpenEditModal(menuId) {
  const menu = state.menus.find((m) => m.id === menuId);
  if (!menu) return;

  elements.modalTitle.textContent = "Edit Menu";
  elements.menuId.value = menu.id;
  elements.menuName.value = menu.name;
  elements.menuCategory.value = menu.category;
  elements.menuPrice.value = menu.price;
  elements.menuStock.value = menu.stock;
  elements.menuImage.value = menu.image || "";

  elements.imagePreview.src =
    menu.image ||
    (menu.category === "Drink" ? DEFAULT_IMAGE_DRINK : DEFAULT_IMAGE_FOOD);

  clearFormValidation();
  elements.menuModal.classList.add("active");
  elements.menuModal.setAttribute("aria-hidden", "false");
  elements.menuName.focus();
}

function closeMenuModal() {
  elements.menuModal.classList.remove("active");
  elements.menuModal.setAttribute("aria-hidden", "true");
  elements.menuForm.reset();
  clearFormValidation();
}

function clearFormValidation() {
  document
    .querySelectorAll(".form-group.has-error")
    .forEach((el) => el.classList.remove("has-error"));
}

/**
 * Poin 7: Terapkan validasi:
 * - Nama Menu wajib diisi.
 * - Kategori wajib diisi.
 * - Harga wajib diisi dan lebih dari 0.
 * - Stock wajib diisi, lebih dari 0, dan tidak boleh bernilai negatif.
 */
function validateMenuForm() {
  clearFormValidation();
  let isValid = true;

  const nameVal = elements.menuName.value.trim();
  const categoryVal = elements.menuCategory.value;
  const priceVal = parseFloat(elements.menuPrice.value);
  const stockVal = parseFloat(elements.menuStock.value);

  // 1. Nama Menu wajib diisi
  if (!nameVal) {
    elements.menuName.parentElement.classList.add("has-error");
    isValid = false;
  }

  // 2. Kategori wajib diisi
  if (!categoryVal) {
    elements.menuCategory.parentElement.classList.add("has-error");
    isValid = false;
  }

  // 3. Harga wajib diisi dan lebih dari 0
  if (isNaN(priceVal) || priceVal <= 0) {
    elements.menuPrice.parentElement.classList.add("has-error");
    isValid = false;
  }

  // 4. Stock wajib diisi, lebih dari 0, dan tidak boleh bernilai negatif
  if (isNaN(stockVal) || stockVal <= 0 || !Number.isInteger(stockVal)) {
    elements.menuStock.parentElement.classList.add("has-error");
    isValid = false;
  }

  return isValid;
}

/**
 * Handle form submission (Create or Update)
 */
function handleMenuFormSubmit(e) {
  e.preventDefault();

  if (!validateMenuForm()) {
    showToast("Mohon lengkapi form dengan benar sesuai validasi!", "danger");
    return;
  }

  const id = elements.menuId.value;
  const name = elements.menuName.value.trim();
  const category = elements.menuCategory.value;
  const price = parseInt(elements.menuPrice.value, 10);
  const stock = parseInt(elements.menuStock.value, 10);
  const isLowStock = stock < 3; // Poin 2 & 5
  let imageUrl = elements.menuImage.value.trim();

  if (!imageUrl) {
    imageUrl = category === "Drink" ? DEFAULT_IMAGE_DRINK : DEFAULT_IMAGE_FOOD;
  }

  if (id) {
    // EDIT MODE
    const menuIndex = state.menus.findIndex((m) => m.id === parseInt(id, 10));
    if (menuIndex !== -1) {
      state.menus[menuIndex] = {
        ...state.menus[menuIndex],
        name,
        category,
        price,
        stock,
        isLowStock,
        status: isLowStock ? "Low Stock" : "Normal",
        image: imageUrl,
      };

      // Update di cart jika ada
      const cartItem = state.cart.find((c) => c.menuId === parseInt(id, 10));
      if (cartItem) {
        cartItem.name = name;
        cartItem.price = price;
      }

      showToast(`Menu "${name}" berhasil diperbarui`, "success");
    }
  } else {
    // CREATE / TAMBAH MENU BARU
    const newId =
      state.menus.length > 0
        ? Math.max(...state.menus.map((m) => m.id)) + 1
        : 1;
    const newMenu = {
      id: newId,
      name,
      category,
      price,
      stock,
      isLowStock,
      status: isLowStock ? "Low Stock" : "Normal",
      image: imageUrl,
    };

    state.menus.unshift(newMenu);
    // Poin 2: urutkan kembali harga tertinggi ke terendah
    state.menus.sort((a, b) => b.price - a.price);

    showToast(`Menu baru "${name}" berhasil ditambahkan!`, "success");
  }

  closeMenuModal();
  renderMenuGrid();
  renderOrderTable();
}

// ==========================================================================
// Delete Confirmation Modal
// ==========================================================================

function handleOpenDeleteModal(menuId) {
  const menu = state.menus.find((m) => m.id === menuId);
  if (!menu) return;

  state.pendingDeleteId = menuId;
  elements.deleteMenuName.textContent = menu.name;
  elements.confirmDeleteModal.classList.add("active");
  elements.confirmDeleteModal.setAttribute("aria-hidden", "false");
}

function closeDeleteModal() {
  elements.confirmDeleteModal.classList.remove("active");
  elements.confirmDeleteModal.setAttribute("aria-hidden", "true");
  state.pendingDeleteId = null;
}

function handleConfirmDelete() {
  if (!state.pendingDeleteId) return;

  const menuId = state.pendingDeleteId;
  const menuIndex = state.menus.findIndex((m) => m.id === menuId);

  if (menuIndex !== -1) {
    const deletedName = state.menus[menuIndex].name;
    state.menus.splice(menuIndex, 1);

    // Hapus juga dari cart jika ada
    const cartIndex = state.cart.findIndex((c) => c.menuId === menuId);
    if (cartIndex !== -1) {
      state.cart.splice(cartIndex, 1);
    }

    showToast(`Menu "${deletedName}" berhasil dihapus`, "warning");
  }

  closeDeleteModal();
  renderMenuGrid();
  renderOrderTable();
}

// ==========================================================================
// Event Listeners Setup
// ==========================================================================

function initEventListeners() {
  // Poin 9: Fitur pencarian berdasarkan nama menu menggunakan debounce 500 ms
  const debouncedSearch = debounce((keyword) => {
    state.searchTerm = keyword.trim();
    renderMenuGrid();
  }, 500);

  elements.searchInput.addEventListener("input", (e) => {
    const query = e.target.value;
    elements.clearSearchBtn.style.display = query ? "block" : "none";
    debouncedSearch(query);
  });

  elements.clearSearchBtn.addEventListener("click", () => {
    elements.searchInput.value = "";
    state.searchTerm = "";
    elements.clearSearchBtn.style.display = "none";
    elements.searchInput.focus();
    renderMenuGrid();
  });

  // Filter Category
  elements.categoryFilter.addEventListener("change", (e) => {
    state.categoryFilter = e.target.value;
    renderMenuGrid();
  });

  // Filter Stock
  elements.stockFilter.addEventListener("change", (e) => {
    state.stockFilter = e.target.value;
    renderMenuGrid();
  });

  // Reset Filters Button
  elements.resetFiltersBtn.addEventListener("click", () => {
    elements.searchInput.value = "";
    elements.categoryFilter.value = "ALL";
    elements.stockFilter.value = "ALL";
    elements.clearSearchBtn.style.display = "none";
    state.searchTerm = "";
    state.categoryFilter = "ALL";
    state.stockFilter = "ALL";
    renderMenuGrid();
  });

  // Add Menu Modal Triggers
  elements.openAddModalBtn.addEventListener("click", openAddMenuModal);
  elements.closeModalBtn.addEventListener("click", closeMenuModal);
  elements.cancelModalBtn.addEventListener("click", closeMenuModal);
  elements.menuForm.addEventListener("submit", handleMenuFormSubmit);

  // Live image preview update
  elements.menuImage.addEventListener("input", (e) => {
    const val = e.target.value.trim();
    if (val) {
      elements.imagePreview.src = val;
    } else {
      elements.imagePreview.src =
        elements.menuCategory.value === "Drink"
          ? DEFAULT_IMAGE_DRINK
          : DEFAULT_IMAGE_FOOD;
    }
  });

  elements.menuCategory.addEventListener("change", (e) => {
    if (!elements.menuImage.value.trim()) {
      elements.imagePreview.src =
        e.target.value === "Drink" ? DEFAULT_IMAGE_DRINK : DEFAULT_IMAGE_FOOD;
    }
  });

  // Delete Modal Triggers
  elements.closeDeleteModalBtn.addEventListener("click", closeDeleteModal);
  elements.cancelDeleteBtn.addEventListener("click", closeDeleteModal);
  elements.confirmDeleteBtn.addEventListener("click", handleConfirmDelete);

  // Cart Buttons
  elements.clearCartBtn.addEventListener("click", handleClearCart);
  elements.checkoutBtn.addEventListener("click", handleCheckout);

  // Mobile cart toggle scroll
  elements.mobileCartBtn.addEventListener("click", () => {
    elements.orderSidebar.scrollIntoView({ behavior: "smooth" });
  });

  // Close modals on clicking overlay backdrop
  [elements.menuModal, elements.confirmDeleteModal].forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeMenuModal();
        closeDeleteModal();
      }
    });
  });

  // Close modals with Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeMenuModal();
      closeDeleteModal();
    }
  });
}

// Global functions accessible from HTML string attributes
window.handleAddToCart = handleAddToCart;
window.handleCartIncrease = handleCartIncrease;
window.handleCartDecrease = handleCartDecrease;
window.handleCartRemoveItem = handleCartRemoveItem;
window.handleOpenEditModal = handleOpenEditModal;
window.handleOpenDeleteModal = handleOpenDeleteModal;

// ==========================================================================
// Application Bootstrap
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  initEventListeners();
  fetchMenuData();
});
