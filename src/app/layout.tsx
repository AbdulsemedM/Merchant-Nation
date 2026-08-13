import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import { ConditionalAppLayout } from "@/components/layout/ConditionalAppLayout";
import { UserRoleProvider } from "@/contexts/UserRoleContext";
import { getServerAuthSession, getActivePermissionsForSession } from "@/lib/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#00ADEF",
};

export const metadata: Metadata = {
  title: "Merchant Nation Command",
  description: "Gamified field sales app for scouting and onboarding merchants",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "MN Command",
  },
  icons: {
    icon: [
      { url: "/icons/icon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerAuthSession();
  const branchPermissions = session ? await getActivePermissionsForSession(session) : [];
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased touch-manipulation`}
        suppressHydrationWarning
      >
        <UserRoleProvider initialSession={session} initialPermissions={branchPermissions}>
          <ConditionalAppLayout>{children}</ConditionalAppLayout>
        </UserRoleProvider>
      </body>
    </html>
  );
}
