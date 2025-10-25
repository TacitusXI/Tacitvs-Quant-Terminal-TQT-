"use client";

import { Navigation } from "@/components/navigation";
import { useKeyboardShortcuts } from "@/lib/use-keyboard-shortcuts";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  // Enable global keyboard shortcuts
  useKeyboardShortcuts();

  return (
    <div className="min-h-screen bg-[#0a0c12]">
      <Navigation />
      <main className="p-6">
        {children}
      </main>
    </div>
  );
}

