import type { RequestHandler } from "express";

export function asyncHandler(fn: RequestHandler): RequestHandler {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export function wrapHandlers(handlers: any[]) {
  return handlers.map((h) =>
    typeof h === "function" && h.length < 4 ? asyncHandler(h as RequestHandler) : h,
  );
}
