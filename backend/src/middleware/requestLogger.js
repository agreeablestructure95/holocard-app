export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.originalUrl;
    const status = res.statusCode;
    const userAgent = req.get('User-Agent') || 'Unknown';
    const ip = req.ip || req.connection.remoteAddress;
    
    // Color coding based on status
    let statusColor = '';
    if (status >= 200 && status < 300) statusColor = '\x1b[32m'; // Green
    else if (status >= 300 && status < 400) statusColor = '\x1b[33m'; // Yellow
    else if (status >= 400 && status < 500) statusColor = '\x1b[31m'; // Red
    else if (status >= 500) statusColor = '\x1b[35m'; // Magenta
    
    console.log(
      `${timestamp} | ${statusColor}${status}\x1b[0m | ${method} ${url} | ${duration}ms | ${ip}`
    );
  });
  
  next();
};
