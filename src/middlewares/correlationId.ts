import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";

export const correlationIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  (req as any).id = uuidv4();
  console.log(
    `[${(req as any).id}] ${req.method} ${req.url} - Iniciando petición`
  );
  next();
};
