const express = require('express');
const router = express.Router();
const os = require('os');
const { getProducts, addProduct, updateProduct, deleteProduct, resetProducts } = require('./apiRoutes');

/**
 * Helper: Format bytes to human readable string
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * GET /
 * Home Dashboard View
 */
router.get('/', (req, res) => {
  const products = getProducts();
  const memory = process.memoryUsage();
  const uptimeSec = Math.floor(process.uptime());

  // Aggregate stats
  const totalProducts = products.length;
  const inStockProducts = products.filter(p => p.stock > 0).length;
  const totalInventoryValue = products.reduce((acc, p) => acc + (p.price * p.stock), 0);
  const categories = [...new Set(products.map(p => p.category))];
  const featured = products.filter(p => p.featured).slice(0, 4);

  res.render('pages/index', {
    title: 'Node.js, Express & EJS Laboratory Showcase',
    activePage: 'home',
    stats: {
      totalProducts,
      inStockProducts,
      outOfStockCount: totalProducts - inStockProducts,
      totalInventoryValue: totalInventoryValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
      categoriesCount: categories.length
    },
    runtime: {
      nodeVersion: process.version,
      v8Version: process.versions.v8,
      platform: `${process.platform} (${os.arch()})`,
      uptime: `${Math.floor(uptimeSec / 60)}m ${uptimeSec % 60}s`,
      memoryRss: formatBytes(memory.rss),
      heapUsed: formatBytes(memory.heapUsed),
      heapTotal: formatBytes(memory.heapTotal),
      cpuCores: os.cpus().length,
      cpuModel: os.cpus()[0]?.model || 'Generic Multi-Core CPU'
    },
    featured,
    alert: req.query.msg ? { message: req.query.msg, type: req.query.type || 'info' } : null
  });
});

/**
 * GET /products
 * SSR Product Catalog with Search, Filtering, and Sorting via req.query
 */
router.get('/products', (req, res) => {
  const allProducts = getProducts();
  let filtered = [...allProducts];

  const { search, category, sort, stock } = req.query;

  // Search filter
  if (search && search.trim() !== '') {
    const q = search.toLowerCase().trim();
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.description && p.description.toLowerCase().includes(q))
    );
  }

  // Category filter
  if (category && category !== 'all') {
    filtered = filtered.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  // Stock filter
  if (stock === 'in-stock') {
    filtered = filtered.filter(p => p.stock > 0);
  } else if (stock === 'out-of-stock') {
    filtered = filtered.filter(p => p.stock === 0);
  }

  // Sort
  if (sort === 'price-low') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-high') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sort === 'name-az') {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sort === 'rating') {
    filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }

  const categories = [...new Set(allProducts.map(p => p.category))];

  res.render('pages/products', {
    title: 'Product Catalog & SSR CRUD - EJS Rendering',
    activePage: 'products',
    products: filtered,
    totalCount: allProducts.length,
    categories,
    query: {
      search: search || '',
      category: category || 'all',
      sort: sort || 'default',
      stock: stock || 'all'
    },
    alert: req.query.msg ? { message: req.query.msg, type: req.query.type || 'success' } : null
  });
});

/**
 * POST /products (Form Submission)
 * Demonstrates traditional form POST data handling via req.body
 */
router.post('/products', (req, res) => {
  const { name, category, price, stock, description, badge, featured } = req.body;

  if (!name || !category || !price) {
    return res.redirect('/products?msg=Please+fill+in+all+required+fields&type=danger');
  }

  const all = getProducts();
  const nextId = all.length > 0 ? Math.max(...all.map(p => p.id)) + 1 : 1;

  const newProd = {
    id: nextId,
    name: name.trim(),
    category: category.trim(),
    price: parseFloat(parseFloat(price).toFixed(2)),
    stock: parseInt(stock, 10) || 0,
    rating: 4.5,
    featured: featured === 'on' || featured === 'true',
    badge: badge ? badge.trim() : (parseInt(stock, 10) === 0 ? 'Out of Stock' : 'New'),
    description: description ? description.trim() : '',
    createdAt: new Date().toISOString()
  };

  addProduct(newProd);

  res.redirect(`/products?msg=Product+'${encodeURIComponent(newProd.name)}'+created+successfully!&type=success`);
});

/**
 * POST /products/update/:id (Form Submission)
 * Demonstrates URL params + form POST update
 */
router.post('/products/update/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { name, category, price, stock, description, badge, featured } = req.body;

  const updated = updateProduct(id, {
    name: name ? name.trim() : undefined,
    category: category ? category.trim() : undefined,
    price: price ? parseFloat(parseFloat(price).toFixed(2)) : undefined,
    stock: stock !== undefined ? parseInt(stock, 10) : undefined,
    description: description ? description.trim() : undefined,
    badge: badge ? badge.trim() : undefined,
    featured: featured === 'on' || featured === 'true'
  });

  if (!updated) {
    return res.redirect('/products?msg=Product+not+found&type=danger');
  }

  res.redirect(`/products?msg=Product+ID+${id}+updated+successfully!&type=success`);
});

/**
 * POST /products/delete/:id (Form Submission)
 * Demonstrates resource deletion through form POST
 */
router.post('/products/delete/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const deleted = deleteProduct(id);

  if (!deleted) {
    return res.redirect('/products?msg=Product+not+found&type=danger');
  }

  res.redirect(`/products?msg=Product+'${encodeURIComponent(deleted.name)}'+was+deleted.&type=info`);
});

/**
 * GET /products/:id
 * Demonstrates URL route parameters (:id) and individual item view
 */
router.get('/products/:id', (req, res, next) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return next(); // Let 404 handler take over
  }

  const products = getProducts();
  const product = products.find(p => p.id === id);

  if (!product) {
    return res.status(404).render('404', {
      title: 'Product Not Found',
      path: req.originalUrl,
      message: `No product exists with ID ${id}. Check the catalog to find available items.`
    });
  }

  // Related products from same category
  const related = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 3);

  res.render('pages/product-detail', {
    title: `${product.name} | Details & URL Params`,
    activePage: 'products',
    product,
    related,
    alert: req.query.msg ? { message: req.query.msg, type: req.query.type || 'success' } : null
  });
});

/**
 * GET /api-explorer
 * Live Interactive REST API Workbench
 */
router.get('/api-explorer', (req, res) => {
  res.render('pages/api-explorer', {
    title: 'Interactive REST API Playground & Tester',
    activePage: 'api-explorer',
    baseUrl: `${req.protocol}://${req.get('host')}`
  });
});

/**
 * GET /architecture
 * Visualizer for Node.js Event Loop & Express Middleware Flow
 */
router.get('/architecture', (req, res) => {
  res.render('pages/architecture', {
    title: 'Node.js Event Loop & Express Architecture Visualizer',
    activePage: 'architecture'
  });
});

/**
 * GET /lab-manual
 * Interactive Academic Lab Manual and Viva-Voce
 */
router.get('/lab-manual', (req, res) => {
  res.render('pages/lab-manual', {
    title: 'Experiment 12 Lab Manual & Viva-Voce',
    activePage: 'lab-manual'
  });
});

module.exports = router;
