"use client";

import { useEffect } from "react";
import { useUIStore } from "@/lib/store";
import { loadSavedTheme, applyTheme } from "@/lib/themes";

/**
 * ThemeProvider
 * 
 * Loads and applies the saved theme on mount.
 * Runs on client-side only to access localStorage.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { currentTheme, setTheme } = useUIStore();

  useEffect(() => {
    // Load saved theme from localStorage
    const savedTheme = loadSavedTheme();
    
    // Apply the theme
    applyTheme(savedTheme);
    
    // Update store if different from default
    if (savedTheme.name !== currentTheme) {
      setTheme(savedTheme.name);
    }
  }, []); // Run once on mount
  
  return <>{children}</>;
}

