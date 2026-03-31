import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateApplicationSchema } from "@/lib/validation";

type RouteContext = {
  params: {
    id: string;
  };
};

export async function GET(_request: Request, { params }: RouteContext) {
  const application = await prisma.application.findUnique({
    where: { id: params.id }
  });

  if (!application) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  return NextResponse.json({ data: application });
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const body = await request.json();
  const parseResult = updateApplicationSchema.safeParse(body);

  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Invalid update payload", details: parseResult.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const application = await prisma.application.update({
      where: { id: params.id },
      data: parseResult.data
    });

    return NextResponse.json({ data: application });
  } catch {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    await prisma.application.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }
}
