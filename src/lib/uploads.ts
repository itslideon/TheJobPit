import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "documents");

const MIME_TO_EXT: Record<string, string> = {
  "application/pdf": ".pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
  "application/msword": ".doc"
};

const ALLOWED_MIMES = new Set(Object.keys(MIME_TO_EXT));

export const MAX_DOCUMENT_BYTES = 8 * 1024 * 1024;

export function isAllowedDocumentMime(mime: string) {
  return ALLOWED_MIMES.has(mime);
}

export function extensionForMime(mime: string) {
  return MIME_TO_EXT[mime] ?? ".bin";
}

export async function ensureDocumentUploadDir() {
  await mkdir(UPLOAD_DIR, { recursive: true });
}

export async function saveDocumentUpload(file: File, mime: string) {
  await ensureDocumentUploadDir();
  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.length > MAX_DOCUMENT_BYTES) {
    throw new Error("File too large");
  }
  const ext = extensionForMime(mime);
  const storedName = `${randomUUID()}${ext}`;
  const fullPath = path.join(UPLOAD_DIR, storedName);
  await writeFile(fullPath, buf);
  return {
    publicPath: `/uploads/documents/${storedName}`,
    storedName
  };
}

export async function deletePublicUpload(publicPath: string | null | undefined) {
  if (!publicPath || !publicPath.startsWith("/uploads/documents/")) {
    return;
  }
  const rel = publicPath.replace(/^\//, "");
  const fullPath = path.join(process.cwd(), "public", rel);
  try {
    await unlink(fullPath);
  } catch {
    // ignore missing file
  }
}
