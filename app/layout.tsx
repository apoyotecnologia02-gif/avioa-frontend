import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Providers } from "@/components/providers";
import { AuthProvider } from "@/components/context/AuthContext";
import { DebugAuth } from "@/components/DebugAuth";
import "./globals.css";
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Portal Empresarial",
  description: "Portal interno de gestión empresarial",
  icons: {
    icon: [{ url: "/avioa-logo.png", type: "image/png" }],
    apple: "/avioa-logo.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0578c8",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="bg-background">
      <body className="font-sans antialiased " suppressHydrationWarning>
        <AuthProvider>
          <Providers>{children}</Providers>
        </AuthProvider>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  );
}
