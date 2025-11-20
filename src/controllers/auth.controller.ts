/** @format */

import { Request, Response } from "express";
import { User } from "../models/user.model";
import bcrypt from "bcrypt";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";
import { RefreshToken } from "../models/refreshToken.model";
import { success } from "zod";

/*
 * Helper: create & persist refresh token document
 */
async function createAndStoreRefreshToken(userId: string) {
  const refreshToken = signRefreshToken(userId);
  // compute expiry data config (approx) by decoding token expiry
  const decoded: any = await (() => {
    try {
      return verifyRefreshToken<{ sub: string; exp: number }>(refreshToken);
    } catch {
      return null;
    }
  })();
  const expiresAt =
    decoded && decoded.exp
      ? new Date(decoded.exp * 1000)
      : new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
  await RefreshToken.create({
    token: refreshToken,
    user: userId,
    expiresAt,
    revoked: false,
  });
  return refreshToken;
}

/** Signup: create user + return both tokens */
export async function signupHandler(req: Request, res: Response) {
  const { name, email, password } = req.body;
  const existing = await User.findOne({ email });
  if (existing)
    return res.status(409).json({ message: "Email already registred" });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash });

  const accessToken = signAccessToken(user.id);
  const refreshToken = await createAndStoreRefreshToken(user.id);

  return res.status(201).json({
    accessToken,
    refreshToken,
    user: { id: user.id, name: user.name, email: user.email },
  });
}

/** Login: validate and return both tokens */
export async function loginHandler(req: Request, res: Response) {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  const accessToken = signAccessToken(user.id);
  const refreshToken = await createAndStoreRefreshToken(user.id);

  return res.json({
    accessToken,
    refreshToken,
    user: { id: user.id, name: user.name, email: user.email },
  });
}

/** Me: uses requiredUser middleware that verifies access token */
export async function meHandler(req: Request, res: Response) {
  const userId = (req as any).userId as string;
  const user = await User.findById(userId).select("name email");
  if (!user) return res.status(404).json({ message: "User not found" });
  return res.json({
    user: { id: user.id, name: user.name, email: user.email },
  });
}

/**
 * Refresh: Client sends { refreshToken } (in body).
 * We verify token signature, find DB record, ensure not revoked & not expired,
 * then rotate: mark old token revoked and issue new refresh + access tokens.
 */
export async function refreshHandler(req: Request, res: Response) {
  const { refreshToken } = req.body;
  if (!refreshToken)
    return res.status(400).json({ message: "Missing refreshToken" });

  // verify signature first
  let payload: { sub: string; exp?: number } | null = null;
  try {
    payload = verifyRefreshToken<{ sub: string; exp?: number }>(refreshToken);
  } catch {
    return res.status(401).json({ message: "Invalid refresh token" });
  }

  // find token in DB
  const tokenDoc = await RefreshToken.findOne({ token: refreshToken });
  if (!tokenDoc || tokenDoc.revoked) {
    return res
      .status(401)
      .json({ message: "Refresh token revoked or not found" });
  }

  // check expiry
  if (tokenDoc.expiresAt && tokenDoc.expiresAt.getTime() < Date.now()) {
    return res.status(401).json({ message: "Refresh token expired" });
  }

  // rotate: revoke old, create new
  tokenDoc.revoked = true;
  await tokenDoc.save();

  const userId = payload.sub;
  const newRefreshToken = await createAndStoreRefreshToken(userId);
  const newAccessToken = signAccessToken(userId);

  return res.json({
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  });
}

/**
 * Logout: client sends { refreshToken}, we mark it revoked (logout).
 * Also accept optional Authorization header to revoke all tokens if desired.
 */
export async function logoutHandler(req: Request, res: Response) {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    // optionally accept header token to revoke
    return res.status(400).json({ message: "Missing refreshToken" });
  }

  const tokenDoc = await RefreshToken.findOne({ token: refreshToken });
  if (!tokenDoc) return res.status(200).json({ success: true }); // already gone

  tokenDoc.revoked = true;
  await tokenDoc.save();
  return res.status(200).json({ success: true });
}
