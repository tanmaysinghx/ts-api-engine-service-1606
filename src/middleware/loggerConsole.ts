import { Request, Response, NextFunction } from 'express';
export function loggerConsole(req: Request, _res: Response, next: NextFunction) {
  console.log(`[${req.method}] ${req.url} - txId:${req.transactionId}`);
  next();
}