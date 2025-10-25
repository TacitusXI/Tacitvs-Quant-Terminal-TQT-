import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { CommandPalette } from "@/components/command-palette";
import { ErrorBoundary } from "@/components/error-boundary";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tacitus Quant Terminal",
  description: "Professional quant trading terminal with EV-first approach",
  icons: {
    icon: [
      { url: '/logo.webp?v=2', type: 'image/webp' },
    ],
    apple: [
      { url: '/logo.webp?v=2', type: 'image/webp' },
    ],
    shortcut: '/logo.webp?v=2',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-[#0a0c12] text-neutral-200`}
      >
        <ErrorBoundary>
          <QueryProvider>
            <ThemeProvider>
              <CommandPalette />
              {children}
            </ThemeProvider>
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
