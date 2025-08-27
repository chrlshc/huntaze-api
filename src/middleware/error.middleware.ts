import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const status = typeof err.status === 'number' ? err.status : 500;
  const message = typeof err.message === 'string' ? err.message : 'Something went wrong';
  const isProd = process.env.NODE_ENV === 'production';

  console.error('Error:', err);

  res.status(status).json({
    error: {
      message: isProd && status >= 500 ? 'Internal server error' : message,
      status,
    },
  });
};
