import { NextRequest, NextResponse } from "next/server";

function getVerifyToken(): string | undefined {
  return (
    process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN ??
    process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN
  );
}

/** Meta webhook verification (WhatsApp Cloud API). */
export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get("hub.mode");
  const challenge = req.nextUrl.searchParams.get("hub.challenge");
  const verifyToken = req.nextUrl.searchParams.get("hub.verify_token");
  const expected = getVerifyToken();

  if (
    mode === "subscribe" &&
    verifyToken &&
    expected &&
    verifyToken === expected
  ) {
    return new NextResponse(challenge ?? "ok");
  }
  return new NextResponse("forbidden", { status: 403 });
}

/** Acknowledge delivery/status events from Meta. */
export async function POST() {
  return NextResponse.json({ ok: true });
}
