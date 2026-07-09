import { Router } from "express";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { prisma } from "../lib/prisma.js";
import { asyncHandler, AppError } from "../lib/http.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const uploadsDir = path.join(__dirname, "..", "..", "uploads");
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 15 * 1024 * 1024 } });

export const documentsRouter = Router({ mergeParams: true });

documentsRouter.post(
  "/",
  upload.single("file"),
  asyncHandler(async (req, res) => {
    if (!req.file) throw new AppError(400, "Keine Datei hochgeladen");
    const doc = await prisma.document.create({
      data: {
        customerId: req.params.customerId,
        name: req.file.originalname,
        mimeType: req.file.mimetype,
        sizeBytes: req.file.size,
        filePath: req.file.filename,
      },
    });
    res.status(201).json(doc);
  })
);

documentsRouter.get(
  "/:documentId/download",
  asyncHandler(async (req, res) => {
    const doc = await prisma.document.findUnique({ where: { id: req.params.documentId } });
    if (!doc || doc.customerId !== req.params.customerId) throw new AppError(404, "Dokument nicht gefunden");
    res.download(path.join(uploadsDir, doc.filePath), doc.name);
  })
);

documentsRouter.delete(
  "/:documentId",
  asyncHandler(async (req, res) => {
    const doc = await prisma.document.findUnique({ where: { id: req.params.documentId } });
    if (!doc || doc.customerId !== req.params.customerId) throw new AppError(404, "Dokument nicht gefunden");
    await prisma.document.delete({ where: { id: req.params.documentId } });
    fs.rm(path.join(uploadsDir, doc.filePath), () => undefined);
    res.status(204).send();
  })
);
