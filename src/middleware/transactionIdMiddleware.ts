import { v4 as uuidv4 } from 'uuid';
import { Request, Response, NextFunction } from 'express';

declare global { namespace Express { interface Request { transactionId?: string } } }

export function transactionIdMiddleware(req: Request, _res: Response, next: NextFunction) {
  req.transactionId = uuidv4();
  next();
}