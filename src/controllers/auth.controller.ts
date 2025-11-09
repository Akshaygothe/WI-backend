/** @format */

import { Request, Response } from "express";
import { User } from "../models/user.model";
import bcrypt from "bcrypt";
import { signJwt } from "../utils/jwt";

export async function registerHandler(req: Request, res: Response) {
  const { name, email, password } = req.body;
  const existing = await User.findOne({ email });
  if (existing)
    return res.status(409).json({ message: "Email already registred" });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash });
  const token = signJwt(user.id);
  return res
    .status(201)
    .json({ token, user: { id: user.id, name: user.name, email: user.email } });
}

export async function loginHandler(req: Request, res: Response) {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });
  const token = signJwt(user.id);
  return res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email },
  });
}

export async function meHandler(req: Request, res: Response) {
  const userId = (req as any).userId as string;
  const user = await User.findById(userId).select("name email");
  if (!user) return res.status(404).json({ message: "User not found" });
  return res.json({
    user: { id: user.id, name: user.name, email: user.email },
  });
}
