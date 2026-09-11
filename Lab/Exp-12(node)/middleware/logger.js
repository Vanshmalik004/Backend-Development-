/**
 * Custom Request Logger Middleware
 * Tracks request timing, method, URL, status code, and IP address.
 * Sets the X-Response-Time header on the HTTP response.
 */
function requestLogger(req, res, next) {
  const startHrTime = process.hrtime();
  const timestamp = new Date().toISOString();

  // Attach finish listener to capture final status code & duration
  res.on('finish', () => {
    const elapsedHrTime = process.hrtime(startHrTime);
    const elapsedMs = (elapsedHrTime[0] * 1000 + elapsedHrTime[1] / 1e6).toFixed(2);
    
    // Status color formatting for terminal
    let statusColor = '\x1b[32m'; // Green (2xx)
    if (res.statusCode >= 500) statusColor = '\x1b[31m'; // Red (5xx)
    else if (res.statusCode >= 400) statusColor = '\x1b[33m'; // Yellow (4xx)
    else if (res.statusCode >= 300) statusColor = '\x1b[36m'; // Cyan (3xx)

    const resetColor = '\x1b[0m';
    const methodColor = '\x1b[35m'; // Magenta

    console.log(
      `[${timestamp}] ${methodColor}${req.method}${resetColor} ${req.originalUrl} ` +
      `${statusColor}${res.statusCode}${resetColor} - ${elapsedMs}ms`
    );
  });

  // Calculate high-resolution duration and set response header
  const originalEnd = res.end;
  res.end = function (...args) {
    const elapsedHrTime = process.hrtime(startHrTime);
    const elapsedMs = (elapsedHrTime[0] * 1000 + elapsedHrTime[1] / 1e6).toFixed(2);
    if (!res.headersSent) {
      res.setHeader('X-Response-Time', `${elapsedMs}ms`);
    }
    return originalEnd.apply(this, args);
  };

  next();
}

module.exports = requestLogger;
