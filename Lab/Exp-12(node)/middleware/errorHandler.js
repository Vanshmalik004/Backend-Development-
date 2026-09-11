/**
 * Centralized Error Handling Middleware
 */

// 404 Not Found Handler
function notFoundHandler(req, res, next) {
  const isApi = req.originalUrl.startsWith('/api');

  if (isApi) {
    return res.status(404).json({
      success: false,
      status: 404,
      error: 'Not Found',
      message: `The requested endpoint '${req.method} ${req.originalUrl}' does not exist on this server.`,
      timestamp: new Date().toISOString()
    });
  }

  // Render friendly EJS 404 page
  res.status(404).render('404', {
    title: '404 - Page Not Found',
    path: req.originalUrl,
    message: `We couldn't locate the resource you requested: ${req.originalUrl}`
  });
}

// 500 Global Server Error Handler
function globalErrorHandler(err, req, res, next) {
  console.error('[SERVER ERROR]', err.stack || err);

  const statusCode = err.status || 500;
  const isApi = req.originalUrl.startsWith('/api');

  if (isApi) {
    return res.status(statusCode).json({
      success: false,
      status: statusCode,
      error: err.name || 'Internal Server Error',
      message: err.message || 'An unexpected error occurred on the server.',
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      timestamp: new Date().toISOString()
    });
  }

  res.status(statusCode).render('500', {
    title: '500 - Server Error',
    path: req.originalUrl,
    error: err,
    message: err.message || 'An internal server error occurred.'
  });
}

module.exports = {
  notFoundHandler,
  globalErrorHandler
};
