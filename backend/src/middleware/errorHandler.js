export const errorHandler = (err, req, res, next) => {
  console.error('❌ Error occurred:', err);

  // Default error
  let error = {
    message: err.message || 'Internal Server Error',
    status: err.status || 500,
  };

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = {
      message: 'Invalid token',
      status: 401,
    };
  }

  if (err.name === 'TokenExpiredError') {
    error = {
      message: 'Token expired',
      status: 401,
    };
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    error = {
      message: err.details ? err.details[0].message : 'Validation error',
      status: 400,
    };
  }

  // Database errors
  if (err.code === '23505') { // PostgreSQL unique violation
    error = {
      message: 'Resource already exists',
      status: 409,
    };
  }

  if (err.code === '23503') { // PostgreSQL foreign key violation
    error = {
      message: 'Referenced resource not found',
      status: 400,
    };
  }

  // Multer errors (file upload)
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = {
      message: 'File too large',
      status: 413,
    };
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    error = {
      message: 'Unexpected field in file upload',
      status: 400,
    };
  }

  // Send error response
  res.status(error.status).json({
    error: error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
