import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    message: env.NODE_ENV === 'production' && statusCode === 500 ? 'Internal Server Error' : message,
    ...(env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};
