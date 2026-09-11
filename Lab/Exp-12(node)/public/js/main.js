/**
 * Experiment 12: Main Client Interactions
 * Handles theme switching, modal dialogs, and alert dismissal
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Theme Management (Dark / Light)
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const savedTheme = localStorage.getItem('exp12_theme') || 'dark';
  applyTheme(savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      localStorage.setItem('exp12_theme', next);
    });
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const themeIcon = document.getElementById('themeIcon');
    const themeText = document.getElementById('themeText');
    if (themeIcon) themeIcon.textContent = theme === 'dark' ? '🌙' : '☀️';
    if (themeText) themeText.textContent = theme === 'dark' ? 'Dark' : 'Light';
  }

  // 2. Alert Dismissal
  const alertCloseBtns = document.querySelectorAll('.alert-dismiss');
  alertCloseBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const alert = btn.closest('.alert-banner');
      if (alert) {
        alert.style.opacity = '0';
        alert.style.transform = 'translateY(-10px)';
        setTimeout(() => alert.remove(), 250);
      }
    });
  });

  // 3. Modals Management (Product Add/Edit)
  const productModal = document.getElementById('productModal');
  const openAddModalBtn = document.getElementById('openAddProductBtn');
  const closeModalBtns = document.querySelectorAll('[data-close-modal]');
  const modalForm = document.getElementById('productModalForm');
  const modalTitle = document.getElementById('modalTitle');

  if (openAddModalBtn && productModal) {
    openAddModalBtn.addEventListener('click', () => {
      modalTitle.textContent = 'Add New Product (POST /products)';
      modalForm.action = '/products';
      modalForm.reset();
      document.getElementById('modalProductId').value = '';
      productModal.classList.add('open');
    });
  }

  // Edit Product buttons in table
  const editButtons = document.querySelectorAll('.edit-product-btn');
  editButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const name = btn.getAttribute('data-name');
      const category = btn.getAttribute('data-category');
      const price = btn.getAttribute('data-price');
      const stock = btn.getAttribute('data-stock');
      const badge = btn.getAttribute('data-badge') || '';
      const featured = btn.getAttribute('data-featured') === 'true';
      const desc = btn.getAttribute('data-description') || '';

      modalTitle.textContent = `Edit Product #${id} (POST /products/update/${id})`;
      modalForm.action = `/products/update/${id}`;

      document.getElementById('modalProductId').value = id;
      document.getElementById('prodName').value = name;
      document.getElementById('prodCategory').value = category;
      document.getElementById('prodPrice').value = price;
      document.getElementById('prodStock').value = stock;
      document.getElementById('prodBadge').value = badge;
      document.getElementById('prodFeatured').checked = featured;
      document.getElementById('prodDescription').value = desc;

      productModal.classList.add('open');
    });
  });

  closeModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (productModal) productModal.classList.remove('open');
    });
  });

  // Close on Escape or click outside
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && productModal && productModal.classList.contains('open')) {
      productModal.classList.remove('open');
    }
  });

  if (productModal) {
    productModal.addEventListener('click', (e) => {
      if (e.target === productModal) {
        productModal.classList.remove('open');
      }
    });
  }
});
