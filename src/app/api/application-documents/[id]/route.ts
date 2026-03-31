import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deletePublicUpload } from "@/lib/uploads";
import { requireUserId } from "@/lib/session-user";
import { updateApplicationDocumentSchema } from "@/lib/validation";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Ctx) {
  const { id } = await context.params;
  const { userId, response } = await requireUserId();
  if (!userId) return response!;
  const body = await request.json();
  const parsed = updateApplicationDocumentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const existing = await prisma.applicationDocument.findFirst({
    where: { id },
    include: { application: true }
  });
  if (!existing || existing.application.userId !== userId) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const data = await prisma.applicationDocument.update({
    where: { id },
    data: parsed.data
  });
  return NextResponse.json({ data });
}

export async function DELETE(_request: Request, context: Ctx) {
  const { id } = await context.params;
  const { userId, response } = await requireUserId();
  if (!userId) return response!;
  const existing = await prisma.applicationDocument.findFirst({
    where: { id },
    include: { application: true }
  });
  if (!existing || existing.application.userId !== userId) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  await prisma.applicationDocument.delete({ where: { id } });

  await deletePublicUpload(existing.attachmentUrl);
  return NextResponse.json({ ok: true });
}
