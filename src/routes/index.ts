/** @format */

import { Router } from "express";
import health from "./health.routes";
import auth from "./auth.routes";

export const router = Router();
router.use("/health", health);
router.use("/auth", auth);
