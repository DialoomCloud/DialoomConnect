import type { Request, Response, NextFunction } from "express";
import debug from "debug";

const log = debug("server:boot");

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  const status = err.status || err.statusCode || 500;
  const message = err instanceof Error ? err.message : "Internal Server Error";
  log(err);
  res.status(status).json({ message });
}

export default errorHandler;
