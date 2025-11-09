/** @format */

import express from "express";
import cors from "cors";
import { router } from "./routes";
import { logger } from "./utils/logger";

export const app = express();
app.use(cors());
app.use(express.json());

// simple request logging
app.use((req, _res, next) => {
  logger.info({ method: req.method, url: req.url }, "request");
  next();
});

app.use("/api", router);

// 404 + error handlers
app.use((_req, res) => res.status(404).json({ message: "Not Founf" }));
app.use((err: any, _req: any, res: any, _next: any) => {
  const code = err.status || 500;
  res.status(code).json({ message: err.message || "Internal Server Error" });
});
