import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function requireUserId() {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) {
    return { userId: null as string | null, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { userId: id, response: null as NextResponse | null };
}
