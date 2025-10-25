/**
 * Error logging utility for the TQT application
 * 
 * This can be extended to send errors to external services like:
 * - Sentry
 * - LogRocket
 * - Datadog
 * - Custom backend endpoint
 */

export interface ErrorLogEntry {
  timestamp: number;
  message: string;
  stack?: string;
  componentStack?: string;
  userAgent: string;
  url: string;
  severity: "low" | "medium" | "high" | "critical";
  context?: Record<string, any>;
}

class ErrorLogger {
  private logs: ErrorLogEntry[] = [];
  private maxLogs = 100; // Keep last 100 errors in memory

  /**
   * Log an error to the console and storage
   */
  log(
    error: Error,
    severity: ErrorLogEntry["severity"] = "medium",
    context?: Record<string, any>
  ): void {
    const entry: ErrorLogEntry = {
      timestamp: Date.now(),
      message: error.message,
      stack: error.stack,
      userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "unknown",
      url: typeof window !== "undefined" ? window.location.href : "unknown",
      severity,
      context,
    };

    // Add to memory
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift(); // Remove oldest
    }

    // Log to console with appropriate level
    if (severity === "critical" || severity === "high") {
      console.error("[ERROR]", entry);
    } else if (severity === "medium") {
      console.warn("[WARNING]", entry);
    } else {
      console.log("[INFO]", entry);
    }

    // Store in localStorage for persistence
    this.saveToStorage();

    // TODO: Send to external service
    // this.sendToService(entry);
  }

  /**
   * Log a React Error Boundary error
   */
  logBoundaryError(
    error: Error,
    errorInfo: { componentStack?: string },
    context?: Record<string, any>
  ): void {
    const entry: ErrorLogEntry = {
      timestamp: Date.now(),
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "unknown",
      url: typeof window !== "undefined" ? window.location.href : "unknown",
      severity: "high",
      context,
    };

    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    console.error("[BOUNDARY ERROR]", entry);
    this.saveToStorage();
  }

  /**
   * Get all logged errors
   */
  getLogs(): ErrorLogEntry[] {
    return [...this.logs];
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
    if (typeof window !== "undefined") {
      localStorage.removeItem("tqt_error_logs");
    }
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Save logs to localStorage
   */
  private saveToStorage(): void {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("tqt_error_logs", JSON.stringify(this.logs));
      } catch (error) {
        console.warn("Failed to save error logs to localStorage:", error);
      }
    }
  }

  /**
   * Load logs from localStorage
   */
  private loadFromStorage(): void {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("tqt_error_logs");
        if (stored) {
          this.logs = JSON.parse(stored);
        }
      } catch (error) {
        console.warn("Failed to load error logs from localStorage:", error);
      }
    }
  }

  /**
   * Send error to external service (placeholder)
   */
  private sendToService(entry: ErrorLogEntry): void {
    // TODO: Implement sending to Sentry, LogRocket, etc.
    // Example:
    // if (typeof Sentry !== 'undefined') {
    //   Sentry.captureException(new Error(entry.message), {
    //     level: entry.severity,
    //     extra: entry.context,
    //   });
    // }
  }
}

// Singleton instance
const errorLogger = new ErrorLogger();

// Initialize from storage
if (typeof window !== "undefined") {
  errorLogger["loadFromStorage"]();
}

export { errorLogger };

/**
 * Helper function to log errors
 */
export function logError(
  error: Error,
  severity: ErrorLogEntry["severity"] = "medium",
  context?: Record<string, any>
): void {
  errorLogger.log(error, severity, context);
}

/**
 * Helper function to log boundary errors
 */
export function logBoundaryError(
  error: Error,
  errorInfo: { componentStack?: string },
  context?: Record<string, any>
): void {
  errorLogger.logBoundaryError(error, errorInfo, context);
}

