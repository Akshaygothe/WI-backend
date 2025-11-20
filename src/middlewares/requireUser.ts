/** @format */

import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";

export function requireUser(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Missing token" });
  try {
    const payload = verifyAccessToken<{ sub: string }>(token);
    (req as any).userId = payload.sub;
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}
