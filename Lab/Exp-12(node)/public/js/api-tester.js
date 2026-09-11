/**
 * Interactive REST API Playground & Live Client
 * Supports GET, POST, PUT, DELETE requests with syntax highlighted responses
 */

document.addEventListener('DOMContentLoaded', () => {
  const methodSelect = document.getElementById('apiMethod');
  const urlInput = document.getElementById('apiUrl');
  const sendBtn = document.getElementById('sendRequestBtn');
  const requestBodyBox = document.getElementById('requestBodyBox');
  const requestBodyInput = document.getElementById('requestBodyInput');
  const responseStatus = document.getElementById('responseStatus');
  const responseTime = document.getElementById('responseTime');
  const responseViewer = document.getElementById('responseViewer');
  const responseHeaders = document.getElementById('responseHeaders');
  const copyResponseBtn = document.getElementById('copyResponseBtn');
  const presetBtns = document.querySelectorAll('[data-preset]');

  if (!sendBtn) return;

  // Toggle request body box based on method
  function updateBodyVisibility() {
    const method = methodSelect.value;
    if (method === 'POST' || method === 'PUT') {
      requestBodyBox.style.display = 'block';
    } else {
      requestBodyBox.style.display = 'none';
    }
  }

  methodSelect.addEventListener('change', updateBodyVisibility);
  updateBodyVisibility();

  // Preset Handler
  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      presetBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');

      const method = btn.getAttribute('data-method');
      const url = btn.getAttribute('data-url');
      const body = btn.getAttribute('data-body');

      methodSelect.value = method;
      urlInput.value = url;
      updateBodyVisibility();

      if (body) {
        try {
          const parsed = JSON.parse(body);
          requestBodyInput.value = JSON.stringify(parsed, null, 2);
        } catch (e) {
          requestBodyInput.value = body;
        }
      } else {
        requestBodyInput.value = '';
      }

      // Automatically trigger request for rapid testing
      executeRequest();
    });
  });

  sendBtn.addEventListener('click', executeRequest);

  async function executeRequest() {
    const method = methodSelect.value;
    const url = urlInput.value.trim();

    sendBtn.disabled = true;
    sendBtn.innerHTML = '<span>⏳ Sending...</span>';
    responseStatus.innerHTML = '<span class="badge badge-gray">Connecting...</span>';
    responseTime.textContent = '...';
    responseViewer.textContent = 'Awaiting response...';
    responseHeaders.textContent = '';

    const startTime = performance.now();

    try {
      const options = {
        method: method,
        headers: {
          'Accept': 'application/json'
        }
      };

      if ((method === 'POST' || method === 'PUT') && requestBodyInput.value.trim()) {
        try {
          JSON.parse(requestBodyInput.value.trim()); // Validate JSON syntax
          options.headers['Content-Type'] = 'application/json';
          options.body = requestBodyInput.value.trim();
        } catch (jsonErr) {
          responseStatus.innerHTML = '<span class="badge badge-danger">Client Error</span>';
          responseViewer.textContent = `Invalid JSON syntax in Request Body:\n${jsonErr.message}`;
          sendBtn.disabled = false;
          sendBtn.innerHTML = '<span>⚡ Send Request</span>';
          return;
        }
      }

      const res = await fetch(url, options);
      const endTime = performance.now();
      const elapsed = Math.round(endTime - startTime);

      // Status badge styling
      let badgeClass = 'badge-success';
      if (res.status >= 500) badgeClass = 'badge-danger';
      else if (res.status >= 400) badgeClass = 'badge-warning';
      else if (res.status >= 300) badgeClass = 'badge-primary';

      responseStatus.innerHTML = `<span class="badge ${badgeClass}">${res.status} ${res.statusText || 'OK'}</span>`;
      responseTime.textContent = `${elapsed} ms`;

      // Read response headers
      const headersObj = {};
      res.headers.forEach((val, key) => {
        headersObj[key] = val;
      });
      responseHeaders.textContent = JSON.stringify(headersObj, null, 2);

      // Read response payload
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        responseViewer.textContent = JSON.stringify(data, null, 2);
      } else {
        const text = await res.text();
        responseViewer.textContent = text;
      }
    } catch (err) {
      const endTime = performance.now();
      responseStatus.innerHTML = '<span class="badge badge-danger">Network Error</span>';
      responseTime.textContent = `${Math.round(endTime - startTime)} ms`;
      responseViewer.textContent = `Fetch Error: ${err.message}\nEnsure the server is running on ${window.location.origin}`;
    } finally {
      sendBtn.disabled = false;
      sendBtn.innerHTML = '<span>⚡ Send Request</span>';
    }
  }

  // Copy Response JSON to Clipboard
  if (copyResponseBtn) {
    copyResponseBtn.addEventListener('click', () => {
      const text = responseViewer.textContent;
      navigator.clipboard.writeText(text).then(() => {
        const originalText = copyResponseBtn.textContent;
        copyResponseBtn.textContent = 'Copied! ✅';
        setTimeout(() => copyResponseBtn.textContent = originalText, 2000);
      });
    });
  }
});
