/** @format */

import { Router } from "express";
import {
  loginSchema,
  refreshSchema,
  signupSchema,
} from "../schemas/auth.schema";
import { validate } from "../middlewares/validateResource";
import {
  loginHandler,
  meHandler,
  signupHandler,
  refreshHandler,
  logoutHandler,
} from "../controllers/auth.controller";
import { requireUser } from "../middlewares/requireUser";

const r = Router();
r.post("/signup", validate(signupSchema), signupHandler);
r.post("/login", validate(loginSchema), loginHandler);
r.post("/refresh", validate(refreshSchema), refreshHandler);
r.post("/logout", validate(refreshSchema), logoutHandler);
r.get("/me", requireUser, meHandler);
export default r;
