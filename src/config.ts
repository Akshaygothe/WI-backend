/** @format */

import "dotenv/config";
import * as jwt from "jsonwebtoken";

const rawAccessExpires = process.env.JWT_EXPIRES_IN ?? "15m"; // short-lived access oken
const numericAccess = Number(rawAccessExpires);
const jwtAccessExpiresIn: jwt.SignOptions["expiresIn"] = Number.isFinite(
  numericAccess,
)
  ? (numericAccess as jwt.SignOptions["expiresIn"])
  : (rawAccessExpires as jwt.SignOptions["expiresIn"]);

// refresh token expiry (longer)
const rawRefreshExpires = process.env.JWT_REFRESH_EXPIRES_IN ?? "30d";
const numericRefresh = Number(rawRefreshExpires);
const jwtRefreshExpiresIn: jwt.SignOptions["expiresIn"] = Number.isFinite(
  numericRefresh,
)
  ? (numericRefresh as jwt.SignOptions["expiresIn"])
  : (rawRefreshExpires as jwt.SignOptions["expiresIn"]);

export const config: {
  port: number;
  mongoUri: string;
  jwtSecret: string;
  jwtExpiresIn: jwt.SignOptions["expiresIn"];
  jwtRefreshSecret: string;
  jwtRefreshExpiresIn: jwt.SignOptions["expiresIn"];
} = {
  port: Number(process.env.PORT ?? 4000),
  mongoUri: process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/worknet_dev",
  jwtSecret: process.env.JWT_SECRET ?? "",
  jwtExpiresIn: jwtAccessExpiresIn,
  jwtRefreshSecret:
    process.env.JWT_REFRESH_SECRET ?? process.env.JWT_SECRET ?? "",
  jwtRefreshExpiresIn,
};
