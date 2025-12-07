import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import QueryProvider from "@/components/providers/QueryProvider";
import SessionProvider from "@/components/SessionProvider";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GrifiLinks - Premium Link in Bio",
  description: "A better, more beautiful link in bio experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${outfit.variable} antialiased selection:bg-emerald-500/30`}
      >
        {/* Ambient Background Glow */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/15 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-green-500/15 blur-[120px]" />
        </div>
        
        <SessionProvider>
          <QueryProvider>
            {children}
            <Toaster position="top-center" theme="light" />
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
