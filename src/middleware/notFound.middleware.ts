import { Request, Response, NextFunction } from 'express';

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      status: 404,
    },
  });
};