export default function OfflinePage() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-semibold">You&apos;re offline</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        Merchant Nation Command needs a connection for live data. Cached pages may
        still be available — try again when you&apos;re back online.
      </p>
    </main>
  );
}
