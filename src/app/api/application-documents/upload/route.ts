import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session-user";
import {
  deletePublicUpload,
  isAllowedDocumentMime,
  MAX_DOCUMENT_BYTES,
  saveDocumentUpload
} from "@/lib/uploads";

export async function POST(request: Request) {
  const { userId, response } = await requireUserId();
  if (!userId) return response!;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart form data" }, { status: 400 });
  }

  const applicationId = formData.get("applicationId");
  const type = formData.get("type");
  const title = formData.get("title");
  const contentRaw = formData.get("content");
  const fileEntry = formData.get("file");

  if (typeof applicationId !== "string" || !applicationId) {
    return NextResponse.json({ error: "applicationId required" }, { status: 400 });
  }
  if (type !== "RESUME" && type !== "COVER_LETTER") {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }
  if (typeof title !== "string" || title.trim().length < 1) {
    return NextResponse.json({ error: "Title required" }, { status: 400 });
  }

  const content =
    typeof contentRaw === "string" ? contentRaw.slice(0, 100_000) : "";

  const application = await prisma.application.findFirst({
    where: { id: applicationId, userId }
  });
  if (!application) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  const hasFile = fileEntry instanceof File && fileEntry.size > 0;

  if (!hasFile) {
    if (!content.trim()) {
      return NextResponse.json(
        { error: "Upload a PDF or Word file, or enter text in Content." },
        { status: 400 }
      );
    }
    const data = await prisma.applicationDocument.create({
      data: {
        applicationId,
        type,
        title: title.trim(),
        content: content.trim()
      }
    });
    return NextResponse.json({ data }, { status: 201 });
  }

  const file = fileEntry as File;

  if (file.size > MAX_DOCUMENT_BYTES) {
    return NextResponse.json(
      { error: `File must be under ${MAX_DOCUMENT_BYTES / (1024 * 1024)} MB` },
      { status: 400 }
    );
  }

  const mime = file.type || "application/octet-stream";
  if (!isAllowedDocumentMime(mime)) {
    return NextResponse.json(
      { error: "Only PDF (.pdf) or Word (.doc, .docx) files are allowed." },
      { status: 400 }
    );
  }

  let publicPath: string;
  try {
    const saved = await saveDocumentUpload(file, mime);
    publicPath = saved.publicPath;
  } catch {
    return NextResponse.json({ error: "Could not save file" }, { status: 500 });
  }

  try {
    const data = await prisma.applicationDocument.create({
      data: {
        applicationId,
        type,
        title: title.trim(),
        content: content.trim(),
        attachmentUrl: publicPath,
        attachmentOriginalName: file.name.slice(0, 240),
        attachmentMime: mime
      }
    });
    return NextResponse.json({ data }, { status: 201 });
  } catch {
    await deletePublicUpload(publicPath);
    return NextResponse.json({ error: "Could not create record" }, { status: 500 });
  }
}
