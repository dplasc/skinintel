import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body?.email === "string" ? body.email : undefined;
    const message = typeof body?.message === "string" ? body.message : undefined;

    void email;
    void message;
  } catch {}

  return NextResponse.json({
    success: true,
    message: "Delete request received",
  });
}
