import { NextResponse } from "next/server";
import { getAdminStats } from "@/lib/admin";
import { requireAdmin } from "@/lib/session-user";

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  const stats = await getAdminStats();
  return NextResponse.json({ data: stats });
}
