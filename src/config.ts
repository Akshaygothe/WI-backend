/** @format */

import "dotenv/config";
import * as jwt from "jsonwebtoken";

const rawExpires = process.env.JWT_EXPIRES_IN ?? "7d";
const numeric = Number(rawExpires);

const jwtExpiresIn: jwt.SignOptions["expiresIn"] = Number.isFinite(numeric)
  ? (numeric as jwt.SignOptions["expiresIn"])
  : (rawExpires as jwt.SignOptions["expiresIn"]);

export const config: {
  port: number;
  mongoUri: string;
  jwtSecret: string;
  jwtExpiresIn: jwt.SignOptions["expiresIn"];
} = {
  port: Number(process.env.PORT ?? 4000),
  mongoUri: process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/worknet_dev",
  jwtSecret: process.env.JWT_SECRET ?? "",
  jwtExpiresIn,
};
