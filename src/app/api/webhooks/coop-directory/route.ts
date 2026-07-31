import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { directory } from "@/backend/services/coop-directory-client";

type CoopWebhookPayload = {
  event?: string;
  type?: string;
  merchantId?: string;
  globalMerchantId?: string;
  id?: string;
  verificationStatus?: string;
  data?: {
    merchantId?: string;
    id?: string;
    verificationStatus?: string;
  };
};

function extractEventName(req: NextRequest, body: CoopWebhookPayload): string {
  return (
    req.headers.get("x-coop-event") ??
    body.event ??
    body.type ??
    ""
  ).trim();
}

function extractMerchantId(body: CoopWebhookPayload): string | null {
  return (
    body.merchantId ??
    body.globalMerchantId ??
    body.id ??
    body.data?.merchantId ??
    body.data?.id ??
    null
  );
}

function verifySignature(rawBody: string, req: NextRequest): boolean {
  const secret = process.env.MERCHANT_DIRECTORY_WEBHOOK_SECRET ?? "";
  if (!secret) {
    console.error("[coop-directory webhook] MERCHANT_DIRECTORY_WEBHOOK_SECRET not set");
    return false;
  }

  const ts = req.headers.get("x-coop-timestamp");
  const sig = req.headers.get("x-coop-signature");
  if (!ts || !sig) return false;

  const expected =
    "sha256=" +
    createHmac("sha256", secret)
      .update(ts + "." + rawBody)
      .digest("hex");

  try {
    const a = Buffer.from(expected);
    const b = Buffer.from(sig);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

async function applyVerificationStatus(
  globalMerchantId: string,
  status: string | null
): Promise<void> {
  directory.invalidateMerchant(globalMerchantId);
  await prisma.merchant.updateMany({
    where: { globalMerchantId },
    data: {
      directorySyncedAt: new Date(),
      ...(status ? { directoryVerificationStatus: status } : {}),
    },
  });
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  if (!verifySignature(rawBody, req)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let body: CoopWebhookPayload;
  try {
    body = JSON.parse(rawBody) as CoopWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const event = extractEventName(req, body);
  const globalMerchantId = extractMerchantId(body);

  if (!globalMerchantId) {
    console.warn("[coop-directory webhook] missing merchant id", event);
    return NextResponse.json({ ok: true, ignored: true });
  }

  const statusFromPayload =
    body.verificationStatus ?? body.data?.verificationStatus ?? null;

  try {
    switch (event) {
      case "MerchantKycVerified":
        await applyVerificationStatus(globalMerchantId, statusFromPayload ?? "VERIFIED");
        break;
      case "MerchantKycRejected":
        await applyVerificationStatus(globalMerchantId, statusFromPayload ?? "REJECTED");
        break;
      case "MerchantKycSubmitted":
        await applyVerificationStatus(globalMerchantId, statusFromPayload ?? "PENDING");
        break;
      case "ApplicationRevoked":
        directory.invalidateMerchant(globalMerchantId);
        await prisma.merchant.updateMany({
          where: { globalMerchantId },
          data: { directorySyncedAt: new Date() },
        });
        console.warn(
          "[coop-directory webhook] ApplicationRevoked for",
          globalMerchantId
        );
        break;
      default:
        directory.invalidateMerchant(globalMerchantId);
        if (statusFromPayload) {
          await applyVerificationStatus(globalMerchantId, statusFromPayload);
        } else {
          await prisma.merchant.updateMany({
            where: { globalMerchantId },
            data: { directorySyncedAt: new Date() },
          });
        }
        break;
    }
  } catch (e) {
    console.error("[coop-directory webhook] handler error", e);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
