/** @format */

import { z } from "zod";
import { Request, Response, NextFunction } from "express";

export const validate =
  <T extends z.ZodTypeAny>(schema: T) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      }) as z.infer<T>;

      if ((parsed as any).body !== undefined) req.body = (parsed as any).body;
      if ((parsed as any).params !== undefined)
        req.params = (parsed as any).params;
      if ((parsed as any).query !== undefined)
        req.query = (parsed as any).query;

      return next();
    } catch (err: unknown) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: "Validation error",
          issue: err.issues,
        });
      }

      return next(err);
    }
  };
