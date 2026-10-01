/**
 * Centralized Express error-handling middleware.
 * Must be mounted last, after all routes, via app.use(errorHandler).
 *
 * @param {Error & { statusCode?: number }} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // A malformed id (e.g. /api/medications/abc) can't match anything: that's
  // a 404, not a server error.
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Not found';
  } else if (err.name === 'CastError' || err.name === 'ValidationError') {
    statusCode = 400;
  }

  res.status(statusCode).json({
    success: false,
    data: null,
    message,
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
}
