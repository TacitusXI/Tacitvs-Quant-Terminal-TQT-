/**
 * 🧠 TACITVS QUANT TERMINAL - Root Layout
 * Retro Cyberpunk + Post-Military Industrial
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeInitializer } from "@/components/ThemeInitializer";
import { QueryProvider } from "@/components/QueryProvider";
import { TacitvsRadio } from "@/components/TacitvsRadio";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tacitvs Quant Terminal",
  description: "Professional quant trading terminal - EV-first, venue-agnostic",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="matrix">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <ThemeInitializer />
          {children}
          <TacitvsRadio />
        </QueryProvider>
      </body>
    </html>
  );
}
