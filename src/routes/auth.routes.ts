/** @format */

import { Router } from "express";
import { loginSchema, registerSchema } from "../schemas/auth.schema";
import { validate } from "../middlewares/validateResource";
import {
  loginHandler,
  meHandler,
  registerHandler,
} from "../controllers/auth.controller";
import { requireUser } from "../middlewares/requireUser";

const r = Router();
r.post("/register", validate(registerSchema), registerHandler);
r.post("/login", validate(loginSchema), loginHandler);
r.get("/me", requireUser, meHandler);
export default r;
