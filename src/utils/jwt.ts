/** @format */

import * as jwt from "jsonwebtoken";
import { config } from "../config";

if (!config.jwtSecret) {
  throw new Error("JWT secret is not defined. Set JWT_SECRET in env.");
}
const JWT_SECRET = config.jwtSecret as jwt.Secret;

export function signJwt(sub: string): string {
  const payload = { sub };
  const options: jwt.SignOptions = {
    expiresIn: config.jwtExpiresIn,
  };
  return jwt.sign(payload, JWT_SECRET, options);
}

export function verifyJwt<T = { sub: string }>(token: string): T {
  const decoded = jwt.verify(token, JWT_SECRET) as unknown as T;
  return decoded;
}
