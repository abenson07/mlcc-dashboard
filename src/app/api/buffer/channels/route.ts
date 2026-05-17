import { NextResponse } from "next/server";
import { requireBufferApiUser, bufferErrorResponse } from "@/lib/buffer/auth";
import { listSupportedChannels } from "@/lib/buffer/queries";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireBufferApiUser();
  if (auth.error) return auth.error;

  try {
    const channels = await listSupportedChannels();
    return NextResponse.json({ channels });
  } catch (e) {
    return bufferErrorResponse(e);
  }
}
