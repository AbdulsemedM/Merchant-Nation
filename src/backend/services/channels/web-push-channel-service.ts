import webpush from "web-push";

export type WebPushSubscription = {
  endpoint: string;
  keys?: {
    p256dh: string;
    auth: string;
  };
};

type WebPushPayload = {
  subscription?: WebPushSubscription;
  endpoint?: string;
  title: string;
  message: string;
  actionUrl?: string;
};

function getVapidConfig():
  | { publicKey: string; privateKey: string; subject: string }
  | undefined {
  const publicKey =
    process.env.VAPID_PUBLIC_KEY ?? process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) return undefined;
  return {
    publicKey,
    privateKey,
    subject: process.env.VAPID_SUBJECT ?? "mailto:notify@merchantnation.app",
  };
}

async function sendViaWebPush(
  subscription: WebPushSubscription,
  payload: WebPushPayload,
): Promise<{ ok: boolean; error?: string }> {
  const vapid = getVapidConfig();
  if (!vapid) {
    return { ok: false, error: "Missing VAPID_PUBLIC_KEY or VAPID_PRIVATE_KEY" };
  }
  const keys = subscription.keys;
  if (!keys?.p256dh || !keys.auth) {
    return { ok: false, error: "Push subscription is missing encryption keys" };
  }

  webpush.setVapidDetails(vapid.subject, vapid.publicKey, vapid.privateKey);

  try {
    await webpush.sendNotification(
      { endpoint: subscription.endpoint, keys },
      JSON.stringify({
        title: payload.title,
        body: payload.message,
        url: payload.actionUrl ?? "/notifications",
        icon: "/icons/icon-192x192.png",
        badge: "/icons/icon-96x96.png",
      }),
    );
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Web push send failed";
    return { ok: false, error: message };
  }
}

async function sendViaGateway(
  payload: WebPushPayload,
): Promise<{ ok: boolean; error?: string }> {
  const gatewayUrl = process.env.PUSH_GATEWAY_URL;
  if (!gatewayUrl) {
    return { ok: false, error: "Missing PUSH_GATEWAY_URL" };
  }
  if (!payload.endpoint) {
    return { ok: false, error: "No web push endpoint saved for user" };
  }

  const res = await fetch(gatewayUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.PUSH_GATEWAY_TOKEN ?? ""}`,
    },
    body: JSON.stringify({
      endpoint: payload.endpoint,
      title: payload.title,
      body: payload.message,
      url: payload.actionUrl,
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-96x96.png",
    }),
  });
  if (!res.ok) return { ok: false, error: `Push gateway ${res.status}` };
  return { ok: true };
}

export async function sendWebPushNotification(
  payload: WebPushPayload,
): Promise<{ ok: boolean; error?: string }> {
  const subscription =
    payload.subscription ??
    (payload.endpoint ? { endpoint: payload.endpoint } : undefined);

  if (!subscription?.endpoint) {
    return { ok: false, error: "No web push subscription saved for user" };
  }

  if (subscription.keys && getVapidConfig()) {
    return sendViaWebPush(subscription, payload);
  }

  return sendViaGateway({ ...payload, endpoint: subscription.endpoint });
}
