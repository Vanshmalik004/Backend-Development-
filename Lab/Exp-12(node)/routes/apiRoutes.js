const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const os = require('os');

// Path to data store
const DATA_FILE = path.join(__dirname, '..', 'data', 'products.json');

// In-memory products repository loaded from JSON file
let products = [];
try {
  const rawData = fs.readFileSync(DATA_FILE, 'utf-8');
  products = JSON.parse(rawData);
} catch (err) {
  console.error('Error initializing products from file, fallback to empty array:', err.message);
  products = [];
}

// Function to get fresh copy of default products for reset
function getDefaultProducts() {
  return [
    {
      id: 1,
      name: "Quantum Pro Mechanical Keyboard",
      category: "Peripherals",
      price: 149.99,
      stock: 38,
      rating: 4.8,
      featured: true,
      description: "Hot-swappable custom tactile switches with RGB per-key backlighting and aircraft-grade aluminum top frame.",
      badge: "Best Seller",
      createdAt: "2026-01-15T08:30:00.000Z"
    },
    {
      id: 2,
      name: "AeroGlide Wireless Gaming Mouse",
      category: "Peripherals",
      price: 79.5,
      stock: 55,
      rating: 4.7,
      featured: true,
      description: "Ultra-lightweight 58g honeycomb shell with 26,000 DPI optical sensor and 80-hour rechargeable battery life.",
      badge: "Top Rated",
      createdAt: "2026-01-20T10:15:00.000Z"
    },
    {
      id: 3,
      name: "OmniView 27\" 4K HDR Monitor",
      category: "Displays",
      price: 429.0,
      stock: 14,
      rating: 4.9,
      featured: true,
      description: "IPS panel with 99% DCI-P3 color gamut, 144Hz refresh rate, 1ms response time, and 90W USB-C Power Delivery.",
      badge: "Premium",
      createdAt: "2026-02-01T14:45:00.000Z"
    },
    {
      id: 4,
      name: "HyperDrive NVMe M.2 2TB SSD",
      category: "Storage",
      price: 189.99,
      stock: 25,
      rating: 4.6,
      featured: false,
      description: "PCIe Gen 4.0 x4 internal solid state drive delivering up to 7,400 MB/s sequential read speed with nickel heatsink.",
      badge: "Fast",
      createdAt: "2026-02-10T12:00:00.000Z"
    },
    {
      id: 5,
      name: "SoundWave Studio ANC Headphones",
      category: "Audio",
      price: 249.0,
      stock: 19,
      rating: 4.8,
      featured: true,
      description: "Active noise cancellation over-ear studio headphones with spatial audio and high-resolution 40mm beryllium drivers.",
      badge: "Staff Pick",
      createdAt: "2026-02-18T16:20:00.000Z"
    },
    {
      id: 6,
      name: "StreamPulse 4K USB-C Webcam",
      category: "Video",
      price: 119.0,
      stock: 0,
      rating: 4.3,
      featured: false,
      description: "Ultra HD webcam with dual stereo beamforming noise-cancelling microphones and magnetic privacy shutter.",
      badge: "Out of Stock",
      createdAt: "2026-02-25T09:10:00.000Z"
    },
    {
      id: 7,
      name: "TitanCore 1000W Modular PSU",
      category: "Components",
      price: 179.99,
      stock: 12,
      rating: 4.9,
      featured: false,
      description: "80 PLUS Platinum certified fully modular power supply unit with 135mm silent fluid dynamic bearing fan.",
      badge: "Platinum",
      createdAt: "2026-03-01T11:30:00.000Z"
    },
    {
      id: 8,
      name: "VortexFlux 360mm AIO Liquid Cooler",
      category: "Components",
      price: 159.0,
      stock: 22,
      rating: 4.7,
      featured: false,
      description: "Triple ARGB radiator fans with infinity mirror pump block and braided zero-permeability sleeved rubber tubing.",
      badge: "Cooling",
      createdAt: "2026-03-05T15:00:00.000Z"
    }
  ];
}

// Helper to save to JSON file safely
function persistData() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist products to disk:', err.message);
  }
}

/**
 * GET /api/products
 * Demonstration of HTTP GET, URL query string filtering, sorting, and pagination
 */
router.get('/products', (req, res) => {
  let result = [...products];
  const { category, search, minPrice, maxPrice, inStock, sort, limit } = req.query;

  // Filter by category
  if (category && category.trim() !== '' && category.toLowerCase() !== 'all') {
    result = result.filter(p => p.category.toLowerCase() === category.toLowerCase().trim());
  }

  // Filter by search query (keyword in name or description)
  if (search && search.trim() !== '') {
    const q = search.toLowerCase().trim();
    result = result.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.description && p.description.toLowerCase().includes(q))
    );
  }

  // Filter by minimum price
  if (minPrice && !isNaN(parseFloat(minPrice))) {
    result = result.filter(p => p.price >= parseFloat(minPrice));
  }

  // Filter by maximum price
  if (maxPrice && !isNaN(parseFloat(maxPrice))) {
    result = result.filter(p => p.price <= parseFloat(maxPrice));
  }

  // Filter by inStock
  if (inStock !== undefined) {
    if (inStock === 'true' || inStock === '1') {
      result = result.filter(p => p.stock > 0);
    } else if (inStock === 'false' || inStock === '0') {
      result = result.filter(p => p.stock === 0);
    }
  }

  // Sorting
  if (sort) {
    switch (sort) {
      case 'price_asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name_asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name_desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'rating_desc':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      default:
        break;
    }
  }

  // Pagination / Limit
  if (limit && !isNaN(parseInt(limit, 10))) {
    result = result.slice(0, parseInt(limit, 10));
  }

  res.status(200).json({
    success: true,
    count: result.length,
    total: products.length,
    filtersApplied: {
      category: category || null,
      search: search || null,
      minPrice: minPrice || null,
      maxPrice: maxPrice || null,
      inStock: inStock || null,
      sort: sort || 'default',
      limit: limit || null
    },
    data: result
  });
});

/**
 * GET /api/products/categories
 * Returns distinct category list
 */
router.get('/products/categories', (req, res) => {
  const categories = [...new Set(products.map(p => p.category))];
  res.status(200).json({
    success: true,
    count: categories.length,
    data: categories
  });
});

/**
 * GET /api/products/:id
 * Demonstration of URL route parameter parsing (req.params.id)
 */
router.get('/products/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({
      success: false,
      status: 400,
      error: 'Bad Request',
      message: `Invalid product ID '${req.params.id}'. Product ID must be an integer.`
    });
  }

  const product = products.find(p => p.id === id);

  if (!product) {
    return res.status(404).json({
      success: false,
      status: 404,
      error: 'Not Found',
      message: `Product with ID ${id} was not found.`
    });
  }

  res.status(200).json({
    success: true,
    data: product
  });
});

/**
 * POST /api/products
 * Demonstration of HTTP POST, request body parsing (req.body), and input validation
 */
router.post('/products', (req, res) => {
  const { name, category, price, stock, description, featured, badge, rating } = req.body;

  const errors = [];
  if (!name || typeof name !== 'string' || name.trim() === '') {
    errors.push("Field 'name' is required and must be a non-empty string.");
  }
  if (!category || typeof category !== 'string' || category.trim() === '') {
    errors.push("Field 'category' is required.");
  }
  if (price === undefined || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
    errors.push("Field 'price' is required and must be a positive number.");
  }
  if (stock !== undefined && (isNaN(parseInt(stock, 10)) || parseInt(stock, 10) < 0)) {
    errors.push("Field 'stock' must be a non-negative integer.");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      status: 400,
      error: 'Validation Failed',
      message: 'Invalid product creation payload.',
      errors
    });
  }

  // Generate next autoincrement ID
  const nextId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;

  const newProduct = {
    id: nextId,
    name: name.trim(),
    category: category.trim(),
    price: parseFloat(parseFloat(price).toFixed(2)),
    stock: stock !== undefined ? parseInt(stock, 10) : 0,
    rating: rating ? parseFloat(rating) : 4.5,
    featured: Boolean(featured),
    badge: badge ? badge.trim() : (stock === 0 ? 'Out of Stock' : 'New'),
    description: description ? description.trim() : '',
    createdAt: new Date().toISOString()
  };

  products.push(newProduct);
  persistData();

  res.status(201).json({
    success: true,
    status: 201,
    message: 'Product created successfully.',
    data: newProduct
  });
});

/**
 * PUT /api/products/:id
 * Demonstration of HTTP PUT, route params + request body validation & resource mutation
 */
router.put('/products/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({
      success: false,
      status: 400,
      error: 'Bad Request',
      message: `Invalid product ID '${req.params.id}'. Product ID must be an integer.`
    });
  }

  const index = products.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({
      success: false,
      status: 404,
      error: 'Not Found',
      message: `Product with ID ${id} was not found.`
    });
  }

  const { name, category, price, stock, description, featured, badge, rating } = req.body;

  // Partial updates supported while validating modified fields
  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ success: false, error: "Field 'name' cannot be empty." });
    }
    products[index].name = name.trim();
  }

  if (category !== undefined) {
    if (typeof category !== 'string' || category.trim() === '') {
      return res.status(400).json({ success: false, error: "Field 'category' cannot be empty." });
    }
    products[index].category = category.trim();
  }

  if (price !== undefined) {
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return res.status(400).json({ success: false, error: "Field 'price' must be a positive number." });
    }
    products[index].price = parseFloat(parsedPrice.toFixed(2));
  }

  if (stock !== undefined) {
    const parsedStock = parseInt(stock, 10);
    if (isNaN(parsedStock) || parsedStock < 0) {
      return res.status(400).json({ success: false, error: "Field 'stock' must be a non-negative integer." });
    }
    products[index].stock = parsedStock;
  }

  if (description !== undefined) products[index].description = String(description).trim();
  if (badge !== undefined) products[index].badge = String(badge).trim();
  if (featured !== undefined) products[index].featured = Boolean(featured);
  if (rating !== undefined && !isNaN(parseFloat(rating))) {
    products[index].rating = Math.min(5, Math.max(0, parseFloat(rating)));
  }

  products[index].updatedAt = new Date().toISOString();
  persistData();

  res.status(200).json({
    success: true,
    status: 200,
    message: `Product ${id} updated successfully.`,
    data: products[index]
  });
});

/**
 * DELETE /api/products/:id
 * Demonstration of HTTP DELETE
 */
router.delete('/products/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({
      success: false,
      status: 400,
      error: 'Bad Request',
      message: `Invalid product ID '${req.params.id}'.`
    });
  }

  const index = products.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({
      success: false,
      status: 404,
      error: 'Not Found',
      message: `Product with ID ${id} does not exist.`
    });
  }

  const deletedItem = products.splice(index, 1)[0];
  persistData();

  res.status(200).json({
    success: true,
    status: 200,
    message: `Product '${deletedItem.name}' (ID: ${id}) was successfully deleted.`,
    deletedId: id
  });
});

/**
 * POST /api/products/reset
 * Resets the dataset to standard default catalog
 */
router.post('/products/reset', (req, res) => {
  products = getDefaultProducts();
  persistData();
  res.status(200).json({
    success: true,
    message: 'Product catalog reset to default 8 seed items.',
    count: products.length,
    data: products
  });
});

/**
 * GET /api/system/info
 * Exposes core Node.js runtime information
 */
router.get('/system/info', (req, res) => {
  const memory = process.memoryUsage();
  const uptimeSeconds = process.uptime();

  res.status(200).json({
    success: true,
    timestamp: new Date().toISOString(),
    runtime: {
      nodeVersion: process.version,
      v8Version: process.versions.v8,
      platform: process.platform,
      architecture: process.arch,
      pid: process.pid,
      uptimeSeconds: Math.floor(uptimeSeconds),
      formattedUptime: `${Math.floor(uptimeSeconds / 3600)}h ${Math.floor((uptimeSeconds % 3600) / 60)}m ${Math.floor(uptimeSeconds % 60)}s`
    },
    memory: {
      rssMB: (memory.rss / (1024 * 1024)).toFixed(2),
      heapTotalMB: (memory.heapTotal / (1024 * 1024)).toFixed(2),
      heapUsedMB: (memory.heapUsed / (1024 * 1024)).toFixed(2),
      externalMB: (memory.external / (1024 * 1024)).toFixed(2)
    },
    host: {
      hostname: os.hostname(),
      osType: os.type(),
      osRelease: os.release(),
      totalMemoryMB: (os.totalmem() / (1024 * 1024)).toFixed(0),
      freeMemoryMB: (os.freemem() / (1024 * 1024)).toFixed(0),
      cpuCores: os.cpus().length,
      cpuModel: os.cpus()[0]?.model || 'Generic Processor'
    }
  });
});

// Export both the router and a getter for products so viewRoutes can use the same dataset
module.exports = {
  router,
  getProducts: () => products,
  resetProducts: () => {
    products = getDefaultProducts();
    persistData();
    return products;
  },
  addProduct: (product) => {
    products.push(product);
    persistData();
    return product;
  },
  updateProduct: (id, updates) => {
    const idx = products.findIndex(p => p.id === id);
    if (idx !== -1) {
      products[idx] = { ...products[idx], ...updates };
      persistData();
      return products[idx];
    }
    return null;
  },
  deleteProduct: (id) => {
    const idx = products.findIndex(p => p.id === id);
    if (idx !== -1) {
      const removed = products.splice(idx, 1)[0];
      persistData();
      return removed;
    }
    return null;
  }
};
