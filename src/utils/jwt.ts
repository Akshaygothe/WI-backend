/** @format */

import * as jwt from "jsonwebtoken";
import { config } from "../config";

if (!config.jwtSecret) {
  throw new Error("JWT secret is not defined. Set JWT_SECRET in env.");
}

if (!config.jwtRefreshSecret) {
  throw new Error(
    "JWT refresh secret is not defined. Set JWT_REFRESH_SECRET in env.",
  );
}

const ACCESS_SECRET = config.jwtSecret as jwt.Secret;
const REFRESH_SECRET = config.jwtRefreshSecret as jwt.Secret;

export function signAccessToken(sub: string) {
  const payload = { sub };
  const options: jwt.SignOptions = { expiresIn: config.jwtExpiresIn };
  return jwt.sign(payload, ACCESS_SECRET, options);
}

export function signRefreshToken(sub: string) {
  const payload = { sub };
  const options: jwt.SignOptions = { expiresIn: config.jwtRefreshExpiresIn };
  return jwt.sign(payload, REFRESH_SECRET, options);
}

export function verifyAccessToken<T = { sub: string }>(token: string): T {
  return jwt.verify(token, ACCESS_SECRET) as unknown as T;
}

export function verifyRefreshToken<T = { sub: string }>(token: string): T {
  return jwt.verify(token, REFRESH_SECRET) as unknown as T;
}
