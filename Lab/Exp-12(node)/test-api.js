/**
 * Automated Verification Script for Experiment 12
 * Tests Express Server, RESTful API endpoints, URL params, Query strings, and EJS rendering
 */

const http = require('http');
const app = require('./server');

const TEST_PORT = 3099;
let server;

function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const reqOptions = {
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: path,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        let json = null;
        if (res.headers['content-type'] && res.headers['content-type'].includes('application/json')) {
          try { json = JSON.parse(data); } catch (e) {}
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          json: json
        });
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('\n================================================================');
  console.log('🧪 EXPERIMENT 12: AUTOMATED VERIFICATION SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Test EJS Dashboard Rendering
    const homeRes = await makeRequest('/');
    assert(homeRes.statusCode === 200, 'GET / returns 200 OK');
    assert(homeRes.body.includes('Node.js, Express.js'), 'GET / HTML contains page title');
    assert(homeRes.body.includes('Node Runtime'), 'GET / HTML contains server diagnostics');

    // 2. Test EJS Products Catalog Rendering
    const productsViewRes = await makeRequest('/products');
    assert(productsViewRes.statusCode === 200, 'GET /products returns 200 OK');
    assert(productsViewRes.body.includes('Inventory Catalog (SSR CRUD)'), 'GET /products contains catalog heading');
    assert(productsViewRes.body.includes('Quantum Pro Mechanical Keyboard'), 'GET /products renders seed products');

    // 3. Test URL Parameters on View Route
    const singleProductViewRes = await makeRequest('/products/1');
    assert(singleProductViewRes.statusCode === 200, 'GET /products/1 returns 200 OK');
    assert(singleProductViewRes.body.includes('Quantum Pro Mechanical Keyboard'), 'GET /products/1 renders item detail');
    assert(singleProductViewRes.body.includes('req.params.id = 1'), 'GET /products/1 demonstrates req.params');

    // 4. Test REST API: GET /api/products
    const apiProductsRes = await makeRequest('/api/products');
    assert(apiProductsRes.statusCode === 200, 'GET /api/products returns 200 OK');
    assert(apiProductsRes.json && apiProductsRes.json.success === true, 'GET /api/products returns JSON success: true');
    assert(Array.isArray(apiProductsRes.json.data) && apiProductsRes.json.data.length > 0, 'GET /api/products returns products array');

    // 5. Test REST API: Query Parameters (category filtering & search)
    const filterRes = await makeRequest('/api/products?category=Peripherals');
    assert(filterRes.statusCode === 200, 'GET /api/products?category=Peripherals returns 200');
    assert(filterRes.json.data.every(p => p.category === 'Peripherals'), 'Query filtering returns only Peripherals');

    // 6. Test REST API: GET /api/products/:id (Valid ID)
    const singleApiRes = await makeRequest('/api/products/1');
    assert(singleApiRes.statusCode === 200, 'GET /api/products/1 returns 200');
    assert(singleApiRes.json.data.id === 1, 'GET /api/products/1 returns correct ID');

    // 7. Test REST API: GET /api/products/:id (Invalid / Non-existent ID)
    const notFoundRes = await makeRequest('/api/products/999');
    assert(notFoundRes.statusCode === 404, 'GET /api/products/999 returns 404 Not Found');
    assert(notFoundRes.json.success === false, 'GET /api/products/999 returns error JSON');

    // 8. Test REST API: POST /api/products (Create with Validation)
    const newProductPayload = {
      name: 'Titan Gaming Rig Tower',
      category: 'Components',
      price: 1299.99,
      stock: 5,
      description: 'High-airflow tempered glass mid-tower case with pre-installed ARGB fans.',
      badge: 'Flagship',
      featured: true
    };
    const createRes = await makeRequest('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: newProductPayload
    });
    assert(createRes.statusCode === 201, 'POST /api/products returns 201 Created');
    assert(createRes.json.data && createRes.json.data.name === newProductPayload.name, 'POST /api/products returns created resource');
    const createdId = createRes.json.data.id;

    // 9. Test REST API: POST /api/products Validation Failure (Missing Required Field)
    const invalidCreateRes = await makeRequest('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { name: 'Incomplete Item' } // missing price & category
    });
    assert(invalidCreateRes.statusCode === 400, 'POST /api/products with invalid body returns 400 Bad Request');
    assert(invalidCreateRes.json.errors && invalidCreateRes.json.errors.length > 0, 'Validation errors array returned');

    // 10. Test REST API: PUT /api/products/:id (Update Resource)
    const updateRes = await makeRequest(`/api/products/${createdId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: { price: 1199.50, stock: 8 }
    });
    assert(updateRes.statusCode === 200, `PUT /api/products/${createdId} returns 200 OK`);
    assert(updateRes.json.data.price === 1199.50, 'Resource price was updated');
    assert(updateRes.json.data.stock === 8, 'Resource stock was updated');

    // 11. Test REST API: DELETE /api/products/:id (Delete Resource)
    const deleteRes = await makeRequest(`/api/products/${createdId}`, {
      method: 'DELETE'
    });
    assert(deleteRes.statusCode === 200, `DELETE /api/products/${createdId} returns 200 OK`);

    // Verify it is gone
    const verifyDeleteRes = await makeRequest(`/api/products/${createdId}`);
    assert(verifyDeleteRes.statusCode === 404, 'Deleted product is no longer found (404)');

    // 12. Test Node System Diagnostics Endpoint
    const sysRes = await makeRequest('/api/system/info');
    assert(sysRes.statusCode === 200, 'GET /api/system/info returns 200 OK');
    assert(sysRes.json.runtime && sysRes.json.runtime.nodeVersion, 'Runtime reports nodeVersion');

    // 13. Test Response-Time Header from Custom Logger Middleware
    assert(apiProductsRes.headers['x-response-time'] !== undefined, 'Custom logger sets X-Response-Time header');

    console.log('\n----------------------------------------------------------------');
    console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
    console.log('----------------------------------------------------------------\n');

    if (failed > 0) {
      process.exitCode = 1;
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exitCode = 1;
  } finally {
    server.close();
  }
}

server = app.listen(TEST_PORT, () => {
  runTests();
});
