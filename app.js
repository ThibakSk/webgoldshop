const STORAGE_KEYS = {
  MENU: 'goldShopMenu',
  CART: 'goldShopCart',
  SALES: 'goldShopSales',
  INVOICE: 'goldShopInvoiceSeq',
};

const generateId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `id-${Math.random().toString(36).slice(2, 10)}-${Date.now()}`;

const defaultProducts = [
  {
    id: generateId(),
    name: 'Aarohi Diamond Ring',
    category: 'Ring',
    price: 48500,
    image:
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=60',
  },
  {
    id: generateId(),
    name: 'Heritage Rope Chain',
    category: 'Chain',
    price: 61200,
    image:
      'https://images.unsplash.com/photo-1518544801958-efcbf8a7ec10?auto=format&fit=crop&w=800&q=60',
  },
  {
    id: generateId(),
    name: 'Kundan Royale Bangle',
    category: 'Bangle',
    price: 38200,
    image:
      'https://images.unsplash.com/photo-1502740479091-635887520276?auto=format&fit=crop&w=800&q=60',
  },
  {
    id: generateId(),
    name: 'Emerald Cascade Necklace',
    category: 'Necklace',
    price: 78250,
    image:
      'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=800&q=60',
  },
  {
    id: generateId(),
    name: 'Noor Drop Pendant',
    category: 'Pendant',
    price: 22800,
    image:
      'https://images.unsplash.com/photo-1522312298940-653d2b79dbce?auto=format&fit=crop&w=800&q=60',
  },
  {
    id: generateId(),
    name: 'Rajwada Temple Kada',
    category: 'Bangle',
    price: 44250,
    image:
      'https://images.unsplash.com/photo-1543294001-f7cd5d7fb516?auto=format&fit=crop&w=800&q=60',
  },
  {
    id: generateId(),
    name: 'Saanvi Heritage Haar',
    category: 'Necklace',
    price: 91200,
    image:
      'https://images.unsplash.com/photo-1520962918287-7448c2878f65?auto=format&fit=crop&w=800&q=60',
  },
  {
    id: generateId(),
    name: 'Nayra Twisted Rope Chain',
    category: 'Chain',
    price: 35800,
    image:
      'https://images.unsplash.com/photo-1522312172494-1a1a52b91621?auto=format&fit=crop&w=800&q=60',
  },
];

const state = {
  products: [],
  cart: [],
  sales: [],
  editingProductId: null,
};

const elements = {};

document.addEventListener('DOMContentLoaded', () => {
  cacheElements();
  hydrateState();
  bindEvents();
  renderAll();
});

function cacheElements() {
  elements.productGrid = document.getElementById('product-grid');
  elements.productSearch = document.getElementById('product-search');
  elements.cartRows = document.getElementById('cart-rows');
  elements.billRows = document.getElementById('bill-rows');
  elements.subtotal = document.getElementById('subtotal');
  elements.making = document.getElementById('making');
  elements.grandTotal = document.getElementById('grand-total');
  elements.billSubtotal = document.getElementById('bill-subtotal');
  elements.billMaking = document.getElementById('bill-making');
  elements.billGrand = document.getElementById('bill-grand');
  elements.invoiceId = document.getElementById('invoice-id');
  elements.invoiceDate = document.getElementById('invoice-date');
  elements.clearCart = document.getElementById('clear-cart');
  elements.printBill = document.getElementById('print-bill');
  elements.payNow = document.getElementById('pay-now');
  elements.finalizeSale = document.getElementById('finalize-sale');
  elements.qrModal = document.getElementById('qr-modal');
  elements.closeQr = document.getElementById('close-qr');
  elements.confirmPayment = document.getElementById('confirm-payment');
  elements.productForm = document.getElementById('product-form');
  elements.productId = document.getElementById('product-id');
  elements.productName = document.getElementById('product-name');
  elements.productCategory = document.getElementById('product-category');
  elements.productPrice = document.getElementById('product-price');
  elements.productImage = document.getElementById('product-image');
  elements.cancelEdit = document.getElementById('cancel-edit');
  elements.catalogueRows = document.getElementById('catalogue-rows');
  elements.reportMonth = document.getElementById('report-month');
  elements.reportOrders = document.getElementById('report-orders');
  elements.reportRevenue = document.getElementById('report-revenue');
  elements.reportAverage = document.getElementById('report-average');
  elements.reportRows = document.getElementById('report-rows');
  elements.productTemplate = document.getElementById('product-card-template');
}

function hydrateState() {
  const storedMenu = readStorage(STORAGE_KEYS.MENU);
  const storedCart = readStorage(STORAGE_KEYS.CART);
  const storedSales = readStorage(STORAGE_KEYS.SALES);

  state.products = Array.isArray(storedMenu) && storedMenu.length
    ? storedMenu
    : defaultProducts;
  state.cart = Array.isArray(storedCart) ? storedCart : [];
  state.sales = Array.isArray(storedSales) ? storedSales : [];
}

function bindEvents() {
  elements.productSearch.addEventListener('input', handleSearch);
  elements.clearCart.addEventListener('click', handleClearCart);
  elements.printBill.addEventListener('click', () => window.print());
  elements.payNow.addEventListener('click', openQrModal);
  elements.closeQr.addEventListener('click', closeQrModal);
  elements.qrModal.addEventListener('click', (event) => {
    if (event.target === elements.qrModal) {
      closeQrModal();
    }
  });
  elements.confirmPayment.addEventListener('click', () => finalizeSale(true));
  elements.finalizeSale.addEventListener('click', () => finalizeSale(false));

  elements.productForm.addEventListener('submit', handleProductSubmit);
  elements.cancelEdit.addEventListener('click', resetProductForm);
  elements.reportMonth.addEventListener('change', renderSalesReport);
}

function handleSearch(event) {
  const query = event.target.value.toLowerCase();
  const filtered = state.products.filter(
    (product) =>
      product.name.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query)
  );
  renderProductCards(filtered);
}

function handleClearCart() {
  state.cart = [];
  persistCart();
  renderCart();
}

function openQrModal() {
  if (!state.cart.length) {
    alert('Add an item to the cart before collecting payment.');
    return;
  }
  elements.qrModal.setAttribute('aria-hidden', 'false');
}

function closeQrModal() {
  elements.qrModal.setAttribute('aria-hidden', 'true');
}

function readStorage(key) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.warn('Unable to read storage', error);
    return null;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn('Unable to write storage', error);
  }
}

function persistMenu() {
  writeStorage(STORAGE_KEYS.MENU, state.products);
}

function persistCart() {
  writeStorage(STORAGE_KEYS.CART, state.cart);
}

function persistSales() {
  writeStorage(STORAGE_KEYS.SALES, state.sales);
}

function renderAll() {
  renderProductCards(state.products);
  renderCart();
  renderCatalogue();
  populateReportMonthOptions();
  renderSalesReport();
}

function renderProductCards(products) {
  elements.productGrid.innerHTML = '';
  const fragment = document.createDocumentFragment();
  products.forEach((product) => {
    const node = elements.productTemplate.content.cloneNode(true);
    const card = node.querySelector('.product-card');
    const img = node.querySelector('img');
    const category = node.querySelector('.product-card__category');
    const title = node.querySelector('h3');
    const price = node.querySelector('.product-card__price');
    const button = node.querySelector('button');

    img.src = product.image;
    img.alt = product.name;
    category.textContent = product.category;
    title.textContent = product.name;
    price.textContent = formatCurrency(product.price);
    button.addEventListener('click', () => addToCart(product.id));

    fragment.appendChild(node);
  });
  elements.productGrid.appendChild(fragment);
}

function addToCart(productId) {
  const product = state.products.find((item) => item.id === productId);
  if (!product) return;

  const existing = state.cart.find((item) => item.id === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    state.cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
    });
  }

  persistCart();
  renderCart();
}

function updateCartItem(productId, delta) {
  const item = state.cart.find((cartItem) => cartItem.id === productId);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) {
    state.cart = state.cart.filter((cartItem) => cartItem.id !== productId);
  }
  persistCart();
  renderCart();
}

function removeCartItem(productId) {
  state.cart = state.cart.filter((cartItem) => cartItem.id !== productId);
  persistCart();
  renderCart();
}

function renderCart() {
  elements.cartRows.innerHTML = '';
  elements.billRows.innerHTML = '';

  if (!state.cart.length) {
    elements.cartRows.innerHTML = `<tr><td colspan="5">Cart is empty. Add an item from the menu.</td></tr>`;
    elements.billRows.innerHTML = `<tr><td colspan="4">No items billed yet.</td></tr>`;
  } else {
    state.cart.forEach((item) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${item.name}</td>
        <td>
          <div class="quantity">
            <button class="ghost" data-action="decrease">−</button>
            <span>${item.quantity}</span>
            <button class="ghost" data-action="increase">+</button>
          </div>
        </td>
        <td>${formatCurrency(item.price)}</td>
        <td>${formatCurrency(item.price * item.quantity)}</td>
        <td><button class="ghost" title="Remove item">✕</button></td>
      `;

      row
        .querySelector('[data-action="decrease"]')
        .addEventListener('click', () => updateCartItem(item.id, -1));
      row
        .querySelector('[data-action="increase"]')
        .addEventListener('click', () => updateCartItem(item.id, 1));
      row.querySelector('button[title="Remove item"]').addEventListener('click', () =>
        removeCartItem(item.id)
      );
      elements.cartRows.appendChild(row);

      const billRow = document.createElement('tr');
      billRow.innerHTML = `
        <td>${item.name}</td>
        <td>${item.quantity}</td>
        <td>${formatCurrency(item.price)}</td>
        <td>${formatCurrency(item.price * item.quantity)}</td>
      `;
      elements.billRows.appendChild(billRow);
    });
  }

  updateTotals();
  updateInvoiceMeta();
}

function updateTotals() {
  const subtotal = state.cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const makingCharge = subtotal * 0.05;
  const grandTotal = subtotal + makingCharge;

  elements.subtotal.textContent = formatCurrency(subtotal);
  elements.making.textContent = formatCurrency(makingCharge);
  elements.grandTotal.textContent = formatCurrency(grandTotal);

  elements.billSubtotal.textContent = formatCurrency(subtotal);
  elements.billMaking.textContent = formatCurrency(makingCharge);
  elements.billGrand.textContent = formatCurrency(grandTotal);
}

function updateInvoiceMeta() {
  const invoiceSeq = readStorage(STORAGE_KEYS.INVOICE) ?? 1001;
  elements.invoiceId.textContent = `RGB-${invoiceSeq}`;
  elements.invoiceDate.textContent = new Date().toLocaleDateString();
}

function finalizeSale(fromQrModal) {
  if (!state.cart.length) {
    alert('Add at least one item to finalize a sale.');
    return;
  }

  const subtotal = state.cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const making = subtotal * 0.05;
  const total = subtotal + making;

  const invoiceSeq = (readStorage(STORAGE_KEYS.INVOICE) ?? 1001) + 1;
  writeStorage(STORAGE_KEYS.INVOICE, invoiceSeq);

  const sale = {
    id: `RGB-${invoiceSeq}`,
    date: new Date().toISOString(),
    items: deepClone(state.cart),
    total,
  };

  state.sales.push(sale);
  persistSales();

  if (fromQrModal) {
    closeQrModal();
  }

  alert('Sale saved to monthly report.');
  handleClearCart();
  populateReportMonthOptions();
  renderSalesReport();
}

function handleProductSubmit(event) {
  event.preventDefault();
  const name = elements.productName.value.trim();
  const category = elements.productCategory.value;
  const price = Number(elements.productPrice.value);
  const image = elements.productImage.value.trim();

  if (!name || !price || !image) {
    alert('Please fill out all fields with valid values.');
    return;
  }

  if (state.editingProductId) {
    const index = state.products.findIndex(
      (item) => item.id === state.editingProductId
    );
    if (index >= 0) {
      state.products[index] = {
        ...state.products[index],
        name,
        category,
        price,
        image,
      };
    }
    state.editingProductId = null;
  } else {
    state.products.push({
      id: generateId(),
      name,
      category,
      price,
      image,
    });
  }

  persistMenu();
  renderProductCards(state.products);
  renderCatalogue();
  resetProductForm();
}

function resetProductForm(event) {
  if (event) event.preventDefault();
  elements.productForm.reset();
  state.editingProductId = null;
  elements.productId.value = '';
}

function renderCatalogue() {
  elements.catalogueRows.innerHTML = '';
  state.products.forEach((product) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${product.name}</td>
      <td>${product.category}</td>
      <td>${formatCurrency(product.price)}</td>
      <td>
        <button class="ghost" data-action="edit">Edit</button>
        <button class="ghost" data-action="delete">Delete</button>
      </td>
    `;
    const [editBtn, deleteBtn] = row.querySelectorAll('button');
    editBtn.addEventListener('click', () => editProduct(product.id));
    deleteBtn.addEventListener('click', () => deleteProduct(product.id));
    elements.catalogueRows.appendChild(row);
  });
}

function editProduct(productId) {
  const product = state.products.find((item) => item.id === productId);
  if (!product) return;
  state.editingProductId = productId;
  elements.productId.value = productId;
  elements.productName.value = product.name;
  elements.productCategory.value = product.category;
  elements.productPrice.value = product.price;
  elements.productImage.value = product.image;
  elements.productName.focus();
}

function deleteProduct(productId) {
  if (!confirm('Remove this product from the menu?')) return;

  state.products = state.products.filter((product) => product.id !== productId);
  persistMenu();
  renderProductCards(state.products);
  renderCatalogue();
}

function populateReportMonthOptions() {
  const months = Array.from(
    new Set(
      state.sales.map((sale) => sale.date.slice(0, 7)) // YYYY-MM
    )
  ).sort((a, b) => (a < b ? 1 : -1));

  if (!months.length) {
    const current = new Date().toISOString().slice(0, 7);
    months.push(current);
  }

  elements.reportMonth.innerHTML = months
    .map((month) => {
      const [year, monthIndex] = month.split('-');
      const date = new Date(Number(year), Number(monthIndex) - 1);
      const label = date.toLocaleDateString(undefined, {
        month: 'long',
        year: 'numeric',
      });
      return `<option value="${month}">${label}</option>`;
    })
    .join('');

  elements.reportMonth.value = months[0];
}

function renderSalesReport() {
  const selectedMonth = elements.reportMonth.value;
  const filteredSales = state.sales.filter(
    (sale) => sale.date.slice(0, 7) === selectedMonth
  );

  const orders = filteredSales.length;
  const revenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
  const average = orders ? revenue / orders : 0;

  elements.reportOrders.textContent = orders.toString();
  elements.reportRevenue.textContent = formatCurrency(revenue);
  elements.reportAverage.textContent = formatCurrency(average);

  elements.reportRows.innerHTML = '';
  if (!filteredSales.length) {
    elements.reportRows.innerHTML = `<tr><td colspan="4">No sales recorded for this month.</td></tr>`;
    return;
  }

  filteredSales.forEach((sale) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${sale.id}</td>
      <td>${new Date(sale.date).toLocaleDateString()}</td>
      <td>${sale.items.length}</td>
      <td>${formatCurrency(sale.total)}</td>
    `;
    elements.reportRows.appendChild(row);
  });
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value);
}

function deepClone(value) {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
}

