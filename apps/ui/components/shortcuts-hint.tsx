"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { KEYBOARD_SHORTCUTS } from "@/lib/use-keyboard-shortcuts";
import { cn } from "@/lib/utils";

export function ShortcutsHint() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-xs text-neutral-500 hover:text-[#2D8EDF] transition-colors font-mono flex items-center gap-1"
        title="Keyboard Shortcuts"
      >
        <span>⌨️</span>
        <span>Shortcuts</span>
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
              onClick={() => setIsOpen(false)}
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-lg"
            >
              <div className="bg-[#0e1117] border border-[#1a1f2e] rounded-xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-[#2D8EDF]">
                    ⌨️ Keyboard Shortcuts
                  </h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-neutral-500 hover:text-neutral-300 transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Navigation */}
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-400 mb-3 uppercase tracking-wider">
                      Navigation
                    </h3>
                    <div className="space-y-2">
                      {Object.entries(KEYBOARD_SHORTCUTS.navigation).map(([key, shortcut]) => (
                        <div key={key} className="flex items-center justify-between">
                          <span className="text-neutral-300 text-sm">{shortcut.description}</span>
                          <kbd className="px-2 py-1 bg-[#1a1f2e] border border-[#2a2f3e] rounded text-xs font-mono text-[#2D8EDF]">
                            ⌘{shortcut.key}
                          </kbd>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-400 mb-3 uppercase tracking-wider">
                      Actions
                    </h3>
                    <div className="space-y-2">
                      {Object.entries(KEYBOARD_SHORTCUTS.actions).map(([key, shortcut]) => (
                        <div key={key} className="flex items-center justify-between">
                          <span className="text-neutral-300 text-sm">{shortcut.description}</span>
                          <kbd className="px-2 py-1 bg-[#1a1f2e] border border-[#2a2f3e] rounded text-xs font-mono text-[#2D8EDF]">
                            ⌘{shortcut.key}
                          </kbd>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tools */}
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-400 mb-3 uppercase tracking-wider">
                      Tools
                    </h3>
                    <div className="space-y-2">
                      {Object.entries(KEYBOARD_SHORTCUTS.tools).map(([key, shortcut]) => (
                        <div key={key} className="flex items-center justify-between">
                          <span className="text-neutral-300 text-sm">{shortcut.description}</span>
                          <kbd className="px-2 py-1 bg-[#1a1f2e] border border-[#2a2f3e] rounded text-xs font-mono text-[#2D8EDF]">
                            ⌘{shortcut.key}
                          </kbd>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* General */}
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-400 mb-3 uppercase tracking-wider">
                      General
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-300 text-sm">Close Modal</span>
                        <kbd className="px-2 py-1 bg-[#1a1f2e] border border-[#2a2f3e] rounded text-xs font-mono text-[#2D8EDF]">
                          Esc
                        </kbd>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#1a1f2e] text-xs text-neutral-500 text-center">
                  Press <kbd className="px-1 py-0.5 bg-[#1a1f2e] rounded text-[10px]">Esc</kbd> to close
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

