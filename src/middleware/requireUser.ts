import { NextFunction, Request, Response } from 'express';

export async function requireUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { user } = res.locals;
  if (!user) {
    return res.sendStatus(403); // Forbidden
  }
  return next();
}
