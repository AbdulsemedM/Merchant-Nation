/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

type PushPayload = {
  title?: string;
  body?: string;
  message?: string;
  url?: string;
  actionUrl?: string;
  icon?: string;
  badge?: string;
  tag?: string;
};

function resolveUrl(path: string): string {
  try {
    return new URL(path, self.location.origin).href;
  } catch {
    return self.location.origin;
  }
}

self.addEventListener("push", (event) => {
  const data: PushPayload = event.data?.json() ?? {};
  const title = data.title ?? "Merchant Nation Command";
  const body = data.body ?? data.message ?? "";
  const url = resolveUrl(data.url ?? data.actionUrl ?? "/notifications");

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: data.icon ?? "/icons/icon-192x192.png",
      badge: data.badge ?? "/icons/icon-96x96.png",
      tag: data.tag,
      data: { url },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data?.url as string | undefined) ?? "/";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        for (const client of clients) {
          if (client.url.startsWith(self.location.origin) && "focus" in client) {
            return client.focus();
          }
        }
        return self.clients.openWindow(url);
      }),
  );
});

export {};
