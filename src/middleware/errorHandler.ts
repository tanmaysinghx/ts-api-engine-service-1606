import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger.js';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  const statusCode = err.status || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  logger.error(`❌ [${_req.method}] ${_req.path} >> ${err.message}`, {
    stack: !isProduction ? err.stack : undefined,
    transactionId: _req.headers['x-orchestrator-transaction-id']
  });

  res.status(statusCode).json({
    success: false,
    message: isProduction ? 'Internal Server Error' : err.message,
    ...(isProduction ? {} : { stack: err.stack }),
    transactionId: _req.headers['x-orchestrator-transaction-id']
  });
}