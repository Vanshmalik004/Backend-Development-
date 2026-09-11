/**
 * Interactive Node.js Event Loop & Express Middleware Simulator
 */

document.addEventListener('DOMContentLoaded', () => {
  const callStackEl = document.getElementById('callStackList');
  const nodeApisEl = document.getElementById('nodeApisList');
  const microtasksEl = document.getElementById('microtasksList');
  const callbackQueueEl = document.getElementById('callbackQueueList');
  const consoleOutputEl = document.getElementById('consoleOutput');
  const eventLoopSpinner = document.getElementById('eventLoopSpinner');

  const btnSync = document.getElementById('btnSimSync');
  const btnAsyncTimer = document.getElementById('btnSimTimer');
  const btnAsyncIO = document.getElementById('btnSimIO');
  const btnPromise = document.getElementById('btnSimPromise');
  const btnClearConsole = document.getElementById('btnClearConsole');

  if (!callStackEl) return;

  function logConsole(text, type = 'normal') {
    const p = document.createElement('div');
    const time = new Date().toLocaleTimeString().split(' ')[0];
    p.innerHTML = `<span style="color: #6b7280;">[${time}]</span> <span class="${type === 'accent' ? 'text-primary' : (type === 'success' ? 'text-green' : '')}">${text}</span>`;
    consoleOutputEl.appendChild(p);
    consoleOutputEl.scrollTop = consoleOutputEl.scrollHeight;
  }

  function addItem(container, text, className = '') {
    const div = document.createElement('div');
    div.className = `sim-item ${className}`;
    div.style.padding = '0.5rem 0.75rem';
    div.style.margin = '0.35rem 0';
    div.style.borderRadius = '6px';
    div.style.background = 'rgba(99, 102, 241, 0.2)';
    div.style.border = '1px solid rgba(99, 102, 241, 0.4)';
    div.style.fontSize = '0.82rem';
    div.style.fontFamily = 'monospace';
    div.textContent = text;
    container.appendChild(div);
    return div;
  }

  function animateSpinner() {
    if (eventLoopSpinner) {
      eventLoopSpinner.style.transform = 'rotate(360deg)';
      setTimeout(() => { eventLoopSpinner.style.transform = 'rotate(0deg)'; }, 400);
    }
  }

  // 1. Synchronous Execution Simulation
  btnSync.addEventListener('click', () => {
    logConsole('1. Call: calculateTotal(items)', 'accent');
    const item1 = addItem(callStackEl, 'calculateTotal()');
    
    setTimeout(() => {
      logConsole('2. In Stack: price * quantity');
      const item2 = addItem(callStackEl, 'computeSubtotal()');
      
      setTimeout(() => {
        item2.remove();
        logConsole('3. computeSubtotal returned 149.99');
        setTimeout(() => {
          item1.remove();
          logConsole('4. calculateTotal finished -> Stack Empty ✅', 'success');
        }, 500);
      }, 600);
    }, 500);
  });

  // 2. Timer Asynchronous Simulation (setTimeout)
  btnAsyncTimer.addEventListener('click', () => {
    logConsole('1. Calling setTimeout(cb, 1000)', 'accent');
    const stackItem = addItem(callStackEl, 'setTimeout(cb, 1000)');

    setTimeout(() => {
      stackItem.remove();
      logConsole('2. Offloaded timer to Libuv / Node APIs');
      const apiItem = addItem(nodeApisEl, 'Timer: 1000ms');

      setTimeout(() => {
        apiItem.remove();
        logConsole('3. Timer expired -> callback pushed to Callback Queue');
        const queueItem = addItem(callbackQueueEl, 'cb() [Timer]');

        setTimeout(() => {
          animateSpinner();
          logConsole('4. Event Loop checks Call Stack (Empty) -> moves cb() to Stack');
          queueItem.remove();
          const runningItem = addItem(callStackEl, 'cb() [Executing]');

          setTimeout(() => {
            runningItem.remove();
            logConsole('5. Timer callback finished execution! ✅', 'success');
          }, 600);
        }, 800);
      }, 1000);
    }, 400);
  });

  // 3. File I/O Simulation (fs.readFile)
  btnAsyncIO.addEventListener('click', () => {
    logConsole('1. Calling fs.readFile("products.json", cb)', 'accent');
    const stackItem = addItem(callStackEl, 'fs.readFile()');

    setTimeout(() => {
      stackItem.remove();
      logConsole('2. Libuv worker thread performs non-blocking disk read');
      const apiItem = addItem(nodeApisEl, 'Libuv I/O: products.json');

      setTimeout(() => {
        apiItem.remove();
        logConsole('3. Disk read completed -> Callback placed in I/O Queue');
        const queueItem = addItem(callbackQueueEl, 'fsCallback(err, data)');

        setTimeout(() => {
          animateSpinner();
          queueItem.remove();
          const runningItem = addItem(callStackEl, 'fsCallback(null, rawData)');
          logConsole('4. Parsing JSON and rendering view');

          setTimeout(() => {
            runningItem.remove();
            logConsole('5. File read and processed successfully! ✅', 'success');
          }, 600);
        }, 700);
      }, 1200);
    }, 400);
  });

  // 4. Promise Microtask Simulation
  btnPromise.addEventListener('click', () => {
    logConsole('1. Calling Promise.resolve().then(cb)', 'accent');
    const stackItem = addItem(callStackEl, 'Promise.resolve()');

    setTimeout(() => {
      stackItem.remove();
      logConsole('2. Promise resolved immediately -> queued in Microtask Queue');
      const microItem = addItem(microtasksEl, '.then() Microtask');

      setTimeout(() => {
        animateSpinner();
        logConsole('3. Microtasks execute BEFORE next Event Loop tick!');
        microItem.remove();
        const runItem = addItem(callStackEl, 'microtask() [Priority]');

        setTimeout(() => {
          runItem.remove();
          logConsole('4. Microtask completed with highest priority! ✅', 'success');
        }, 500);
      }, 600);
    }, 400);
  });

  if (btnClearConsole) {
    btnClearConsole.addEventListener('click', () => {
      consoleOutputEl.innerHTML = '';
      logConsole('Console cleared.');
    });
  }
});
