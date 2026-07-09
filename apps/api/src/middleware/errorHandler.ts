import type { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { AppError } from "../lib/http.js";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: err.message });
  }
  if (err instanceof ZodError) {
    return res.status(400).json({ error: "Ungültige Eingabe", details: err.flatten() });
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Nicht gefunden" });
    }
    if (err.code === "P2002") {
      return res.status(409).json({ error: "Eintrag existiert bereits (eindeutiger Wert doppelt)" });
    }
  }
  console.error(err);
  return res.status(500).json({ error: "Interner Serverfehler" });
}
