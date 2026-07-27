import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyTokenForEdge, createTokenForEdge } from "@/lib/jwt";
import { SESSION_IDLE_TIMEOUT_SECONDS } from "@/lib/session-config";

const AUTH_COOKIE_NAME = "mn_token";

const secureCookie =
  process.env.NODE_ENV === "production" || process.env.VERCEL === "1";

// External webhooks/cron must bypass session auth (they use their own secrets).
const PUBLIC_API_PATHS = new Set([
  "/api/notifications/telegram/webhook",
  "/api/notifications/facebook/webhook",
  "/api/notifications/whatsapp/webhook",
  "/api/notifications/scheduled",
]);

/** PWA assets in /public must be readable without a session. */
function isPublicPwaAsset(pathname: string): boolean {
  if (pathname === "/manifest.json" || pathname === "/sw.js") return true;
  if (
    pathname.startsWith("/workbox-") ||
    pathname.startsWith("/worker-") ||
    pathname.startsWith("/swe-worker-")
  ) {
    return true;
  }
  return false;
}

const CORS_HEADERS = [
  { key: "Access-Control-Allow-Methods", value: "GET, POST, PUT, PATCH, DELETE, OPTIONS" },
  { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization, Next-Action, RSC" },
  { key: "Access-Control-Allow-Credentials", value: "true" },
] as const;

function isServerActionRequest(request: NextRequest): boolean {
  return request.headers.has("next-action") || request.headers.has("Next-Action");
}

async function attachRefreshedSessionCookie(
  request: NextRequest,
  response: NextResponse,
  session: Parameters<typeof createTokenForEdge>[0]
): Promise<NextResponse> {
  // Server Actions set their own session cookie (e.g. after password change).
  if (isServerActionRequest(request)) return response;
  try {
    const newToken = await createTokenForEdge(session);
    response.cookies.set(AUTH_COOKIE_NAME, newToken, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: secureCookie,
      maxAge: SESSION_IDLE_TIMEOUT_SECONDS,
    });
  } catch {
    // ignore
  }
  return response;
}

function getCorsOrigin(req: NextRequest): string | null {
  const origin = req.headers.get("origin");
  if (!origin) return null;
  try {
    const u = new URL(origin);
    if (u.hostname === "localhost" || u.hostname === "127.0.0.1") return origin;
    return null;
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const origin = getCorsOrigin(request);

  if (request.method === "OPTIONS") {
    const res = new NextResponse(null, { status: 204 });
    CORS_HEADERS.forEach(({ key, value }) => res.headers.set(key, value));
    if (origin) res.headers.set("Access-Control-Allow-Origin", origin);
    return res;
  }

  const { pathname } = request.nextUrl;

  if (
    pathname === "/api-docs" ||
    pathname === "/openapi.yaml" ||
    PUBLIC_API_PATHS.has(pathname) ||
    isPublicPwaAsset(pathname)
  ) {
    return addCors(NextResponse.next(), origin);
  }

  if (pathname === "/login") {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return addCors(NextResponse.next(), origin);
    const session = await verifyTokenForEdge(token);
    if (!session) return addCors(NextResponse.next(), origin);
    if (session.mustChangePassword) {
      return addCors(NextResponse.redirect(new URL("/change-password", request.url)), origin);
    }
    return addCors(NextResponse.redirect(new URL("/", request.url)), origin);
  }

  // Public landing page at `/` for logged-out visitors; auth enforced in page.tsx.
  if (pathname === "/") {
    return addCors(NextResponse.next(), origin);
  }

  if (pathname === "/change-password") {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!token) {
      const res = NextResponse.redirect(new URL("/login", request.url));
      return addCors(res, origin);
    }
    const session = await verifyTokenForEdge(token);
    if (!session) {
      const res = NextResponse.redirect(new URL("/login", request.url));
      res.cookies.set(AUTH_COOKIE_NAME, "", { path: "/", maxAge: 0 });
      return addCors(res, origin);
    }
    // Do not refresh the session cookie here — it would overwrite the new token
    // issued by the change-password Server Action (mustChangePassword stays true).
    return addCors(NextResponse.next(), origin);
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    const res = NextResponse.redirect(new URL("/login", request.url));
    return addCors(res, origin);
  }
  const session = await verifyTokenForEdge(token);
  if (!session) {
    const res = NextResponse.redirect(new URL("/login", request.url));
    res.cookies.set(AUTH_COOKIE_NAME, "", { path: "/", maxAge: 0 });
    return addCors(res, origin);
  }
  if (session.mustChangePassword) {
    const res = await attachRefreshedSessionCookie(
      request,
      NextResponse.redirect(new URL("/change-password", request.url)),
      session
    );
    return addCors(res, origin);
  }
  const res = await attachRefreshedSessionCookie(
    request,
    NextResponse.next(),
    session
  );
  return addCors(res, origin);
}

function addCors(res: NextResponse, origin: string | null) {
  CORS_HEADERS.forEach(({ key, value }) => res.headers.set(key, value));
  if (origin) res.headers.set("Access-Control-Allow-Origin", origin);
  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest\\.json|sw\\.js|workbox-|worker-|swe-worker-|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
