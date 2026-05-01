const errorMiddleware = (err, req, res, next) => {
  console.error('[Global Error]:', err);

  const statusCode = err.statusCode || 500;
  const errorMsg = err.isOperational ? err.message : 'Internal Server Error';
  const errorCode = err.code || 'SERVER_ERROR';

  res.status(statusCode).json({
    success: false,
    error: errorMsg,
    code: errorCode,
  });
};

module.exports = errorMiddleware;
