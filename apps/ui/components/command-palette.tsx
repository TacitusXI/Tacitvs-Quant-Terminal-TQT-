"use client";

import { useState, useEffect, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/lib/store";

interface Command {
  id: string;
  label: string;
  description: string;
  action: () => void;
  icon?: string;
  shortcut?: string;
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const { setActivePage, setOpsMode } = useUIStore();

  // All available commands
  const commands: Command[] = [
    // Navigation
    {
      id: "nav-ops",
      label: "Go to OPS Terminal",
      description: "Navigate to operations dashboard",
      icon: "⚙️",
      shortcut: "1",
      action: () => {
        setActivePage("ops");
        router.push("/OPS");
        setIsOpen(false);
      },
    },
    {
      id: "nav-lab",
      label: "Go to LAB Terminal",
      description: "Navigate to research laboratory",
      icon: "🔬",
      shortcut: "2",
      action: () => {
        setActivePage("lab");
        router.push("/LAB");
        setIsOpen(false);
      },
    },
    {
      id: "nav-metrics",
      label: "Go to METRICS Dashboard",
      description: "Navigate to performance metrics",
      icon: "📊",
      shortcut: "3",
      action: () => {
        setActivePage("metrics");
        router.push("/METRICS");
        setIsOpen(false);
      },
    },
    {
      id: "nav-console",
      label: "Go to CONSOLE",
      description: "Navigate to command console",
      icon: "⚡",
      shortcut: "4",
      action: () => {
        setActivePage("console");
        router.push("/CONSOLE");
        setIsOpen(false);
      },
    },
    // OPS Mode
    {
      id: "ops-arm",
      label: "Set OPS Mode: ARM",
      description: "Enable automatic trading",
      icon: "⚡",
      action: () => {
        setOpsMode("ARM");
        setIsOpen(false);
      },
    },
    {
      id: "ops-hold",
      label: "Set OPS Mode: HOLD",
      description: "Hold current positions",
      icon: "⚠️",
      action: () => {
        setOpsMode("HOLD");
        setIsOpen(false);
      },
    },
    {
      id: "ops-sim",
      label: "Set OPS Mode: SIM",
      description: "Simulation mode (paper trading)",
      icon: "🔬",
      action: () => {
        setOpsMode("SIM");
        setIsOpen(false);
      },
    },
    {
      id: "ops-off",
      label: "Set OPS Mode: OFF",
      description: "Disable trading operations",
      icon: "🔴",
      action: () => {
        setOpsMode("OFF");
        setIsOpen(false);
      },
    },
  ];

  // Filter commands based on search
  const filteredCommands = search
    ? commands.filter(
        (cmd) =>
          cmd.label.toLowerCase().includes(search.toLowerCase()) ||
          cmd.description.toLowerCase().includes(search.toLowerCase())
      )
    : commands;

  // Reset selected index when filtered commands change
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  // Global keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      // Cmd+K / Ctrl+K to toggle
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        setSearch("");
      }
      // Escape to close
      else if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        setSearch("");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < filteredCommands.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setSearch("");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
            onClick={() => setIsOpen(false)}
          />

          {/* Command Palette Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-1/4 left-1/2 -translate-x-1/2 w-full max-w-2xl z-[101]"
          >
            <div className="bg-[#0a0a14] border-2 border-[var(--color-primary)] rounded-2xl shadow-2xl overflow-hidden neon-glow-purple">
              {/* Search Input */}
              <div className="flex items-center gap-3 px-4 py-4 border-b border-[var(--color-primary)]/30 bg-[#050508]">
                <span className="text-2xl">🔍</span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a command or search..."
                  className="flex-1 bg-transparent text-lg text-white placeholder:text-neutral-600 outline-none font-mono"
                  autoFocus
                />
                <kbd className="px-2 py-1 text-xs font-mono bg-[var(--color-primary)]/20 text-[var(--color-secondary)] rounded border border-[var(--color-primary)]/30">
                  ESC
                </kbd>
              </div>

              {/* Commands List */}
              <div className="max-h-96 overflow-y-auto">
                {filteredCommands.length === 0 ? (
                  <div className="px-4 py-8 text-center text-neutral-500">
                    No commands found for "{search}"
                  </div>
                ) : (
                  filteredCommands.map((command, index) => (
                    <motion.div
                      key={command.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className={cn(
                        "flex items-center justify-between px-4 py-3 cursor-pointer transition-colors border-b border-neutral-800/50",
                        index === selectedIndex
                          ? "bg-[var(--color-primary)]/20 border-l-4 border-l-[var(--color-secondary)]"
                          : "hover:bg-[var(--color-primary)]/10"
                      )}
                      onClick={() => command.action()}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {command.icon && (
                          <span className="text-2xl">{command.icon}</span>
                        )}
                        <div>
                          <div className="text-white font-medium">
                            {command.label}
                          </div>
                          <div className="text-sm text-neutral-500">
                            {command.description}
                          </div>
                        </div>
                      </div>
                      {command.shortcut && (
                        <kbd className="px-2 py-1 text-xs font-mono bg-[var(--color-primary)]/20 text-[var(--color-secondary)] rounded border border-[var(--color-primary)]/30">
                          {command.shortcut}
                        </kbd>
                      )}
                    </motion.div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-4 py-2 bg-[#050508] border-t border-[var(--color-primary)]/30 text-xs text-neutral-500 font-mono">
                <div className="flex gap-4">
                  <span>↑↓ Navigate</span>
                  <span>↵ Select</span>
                  <span>ESC Close</span>
                </div>
                <div>{filteredCommands.length} commands</div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

