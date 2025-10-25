"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { useHealth } from "@/lib/hooks";
import { useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShortcutsHint } from "@/components/shortcuts-hint";

const navigation = [
  { id: "ops", label: "OPS", shortcut: "1" },
  { id: "lab", label: "LAB", shortcut: "2" },
  { id: "metrics", label: "METRICS", shortcut: "3" },
  { id: "console", label: "CONSOLE", shortcut: "4" },
];

export function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: health } = useHealth();
  const { setCommandPaletteOpen, dataMode } = useUIStore();

  const isConnected = health?.ok ?? false;

  return (
    <nav className="border-b border-[#1a1f2e] bg-[#0a0c12]/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="w-full px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Far Left */}
          <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
            <div className="relative w-8 h-8">
              <Image
                src="/logo.webp?v=2"
                alt="TQT Logo"
                width={32}
                height={32}
                className="object-contain group-hover:scale-110 transition-transform"
                priority
                unoptimized
              />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] bg-clip-text text-transparent">
              TQT
            </span>
          </Link>

          {/* Navigation Items - Center */}
          <div className="flex items-center gap-2 flex-1 justify-center">
            {navigation.map((item) => (
              <Link
                key={item.id}
                href={`/${item.label}`}
                className={cn(
                  "px-4 py-2 rounded-lg font-medium text-sm transition-all relative group",
                  pathname === `/${item.label}`
                    ? "bg-[var(--color-primary)]/20 text-[var(--color-secondary)] border border-[var(--color-primary)]/50 neon-glow-cyan"
                    : "text-neutral-400 hover:text-[var(--color-secondary)] hover:bg-[#1a1f2e]"
                )}
              >
                {item.label}
                <span className="absolute -top-1 -right-1 text-[10px] text-neutral-600 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                  ⌘{item.shortcut}
                </span>
              </Link>
            ))}
          </div>

          {/* Right Side - Far Right */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Data Mode Indicator */}
            <div className="flex items-center gap-2 px-2 py-1 rounded bg-[#1a1f2e]/50 border border-[#2a2f3e]">
              <span className="text-xs">
                {dataMode === "MOCK" ? "🎭" : "🔴"}
              </span>
              <span className="text-xs font-mono text-neutral-400">
                {dataMode}
              </span>
            </div>

            {/* Backend Status */}
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  isConnected
                    ? "bg-[#16A34A] shadow-[0_0_8px_rgba(22,163,74,0.6)]"
                    : "bg-[var(--color-danger)] shadow-[0_0_8px_var(--glow-danger)]"
                )}
              />
              <span className="text-xs text-neutral-500">
                {isConnected ? "LIVE" : "OFFLINE"}
              </span>
            </div>

            {/* Notifications */}
            <button className="text-neutral-500 hover:text-[var(--color-secondary)] transition-colors relative">
              🔔
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-[var(--color-danger)] rounded-full" />
            </button>

            {/* Settings */}
            <button className="text-neutral-500 hover:text-[var(--color-secondary)] transition-colors">
              ⚙️
            </button>

            {/* Command Palette Hint */}
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="text-xs text-neutral-500 hover:text-[var(--color-secondary)] transition-colors font-mono flex items-center gap-1"
            >
              <span>⌘K</span>
            </button>

            {/* Shortcuts Hint */}
            <ShortcutsHint />
          </div>
        </div>
      </div>
    </nav>
  );
}

