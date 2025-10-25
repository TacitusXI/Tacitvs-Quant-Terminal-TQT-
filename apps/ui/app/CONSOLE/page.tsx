"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { MainLayout } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Timestamp } from "@/components/ui/timestamp";
import { useUIStore } from "@/lib/store";
import { cn } from "@/lib/utils";

// Command type
interface Command {
  input: string;
  output: string[];
  type: "success" | "error" | "info";
  timestamp: number;
}

// System log entry
interface LogEntry {
  message: string;
  type: "success" | "warning" | "info" | "error";
  timestamp: number;
}

// Available commands with descriptions
const AVAILABLE_COMMANDS = [
  { cmd: "help", desc: "Show available commands", usage: "help" },
  { cmd: "clear", desc: "Clear console history", usage: "clear" },
  { cmd: "status", desc: "Show system status", usage: "status" },
  { cmd: "mode", desc: "Switch data mode", usage: "mode [mock|live]" },
  { cmd: "arm", desc: "Set OPS mode to ARM", usage: "arm" },
  { cmd: "hold", desc: "Set OPS mode to HOLD", usage: "hold" },
  { cmd: "sim", desc: "Set OPS mode to SIM", usage: "sim" },
  { cmd: "off", desc: "Set OPS mode to OFF", usage: "off" },
  { cmd: "backtest", desc: "Run backtest", usage: "backtest <strategy> <market> <interval> <days>" },
  { cmd: "mc", desc: "Run Monte Carlo simulation", usage: "mc <runs>" },
  { cmd: "wf", desc: "Run Walk-Forward analysis", usage: "wf <strategy> <market>" },
  { cmd: "markets", desc: "List available markets", usage: "markets" },
  { cmd: "ev", desc: "Calculate EV for market", usage: "ev <market>" },
];

export default function CONSOLE() {
  const [input, setInput] = useState("");
  const [commands, setCommands] = useState<Command[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [systemLogs, setSystemLogs] = useState<LogEntry[]>([
    { message: "System initialized successfully", type: "success", timestamp: Date.now() - 300000 },
    { message: "Backend connection established", type: "success", timestamp: Date.now() - 240000 },
    { message: "Market data loaded: 6 symbols", type: "info", timestamp: Date.now() - 180000 },
  ]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(0);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const { setOpsMode, opsMode, backendConnected, dataMode, setDataMode } = useUIStore();

  // Auto-scroll to bottom on new commands
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [commands]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Update suggestions based on input
  useEffect(() => {
    if (input.startsWith("/")) {
      const query = input.slice(1).toLowerCase();
      const matches = AVAILABLE_COMMANDS
        .filter(cmd => cmd.cmd.toLowerCase().startsWith(query))
        .map(cmd => `/${cmd.cmd}`);
      setSuggestions(matches);
      setSelectedSuggestion(0);
    } else {
      setSuggestions([]);
    }
  }, [input]);

  // Execute command
  const executeCommand = (cmdInput: string) => {
    const trimmed = cmdInput.trim();
    if (!trimmed) return;

    const timestamp = Date.now();
    let output: string[] = [];
    let type: "success" | "error" | "info" = "info";

    // Parse command
    const parts = trimmed.split(/\s+/);
    const cmd = parts[0].replace("/", "").toLowerCase();
    const args = parts.slice(1);

    // Execute based on command
    switch (cmd) {
      case "help":
        output = [
          "Available Commands:",
          "",
          ...AVAILABLE_COMMANDS.map(c => `  ${c.usage.padEnd(40)} - ${c.desc}`),
          "",
          "Shortcuts:",
          "  Ctrl/Cmd+K - Open command palette",
          "  Up/Down - Navigate command history",
          "  Tab - Autocomplete",
        ];
        type = "info";
        break;

      case "clear":
        setCommands([]);
        setSystemLogs([]);
        output = ["Console cleared"];
        type = "success";
        break;

      case "status":
        output = [
          "=== SYSTEM STATUS ===",
          `Backend: ${backendConnected ? "✅ CONNECTED" : "❌ DISCONNECTED"}`,
          `OPS Mode: ${opsMode}`,
          `Data Mode: ${dataMode} ${dataMode === "MOCK" ? "🎭" : "🔴"}`,
          `Active Markets: 6`,
          `Uptime: ${Math.floor(Math.random() * 24)}h ${Math.floor(Math.random() * 60)}m`,
        ];
        type = "success";
        break;

      case "mode":
        if (args.length === 0) {
          output = [
            `Current data mode: ${dataMode}`,
            "",
            "Usage: mode [mock|live]",
            "  mock - Use mock data for visualization only",
            "  live - Use real data from backend API",
          ];
          type = "info";
        } else {
          const newMode = args[0].toUpperCase();
          if (newMode === "MOCK" || newMode === "LIVE") {
            setDataMode(newMode as "MOCK" | "LIVE");
            output = [
              `🔄 Data mode switched to ${newMode}`,
              "",
              newMode === "MOCK" 
                ? "🎭 Using mock data - Safe for visualization and testing"
                : "🔴 Using live data - Real market information from API",
            ];
            type = "success";
            addSystemLog(`Data mode changed to ${newMode}`, newMode === "LIVE" ? "warning" : "info");
          } else {
            output = [
              `Error: Invalid mode '${args[0]}'`,
              "Valid modes: mock, live",
            ];
            type = "error";
          }
        }
        break;

      case "arm":
        setOpsMode("ARM");
        output = ["⚡ OPS Mode set to ARM"];
        type = "success";
        addSystemLog("OPS Mode changed to ARM", "success");
        break;

      case "hold":
        setOpsMode("HOLD");
        output = ["⚠️ OPS Mode set to HOLD"];
        type = "success";
        addSystemLog("OPS Mode changed to HOLD", "warning");
        break;

      case "sim":
        setOpsMode("SIM");
        output = ["🔬 OPS Mode set to SIM"];
        type = "success";
        addSystemLog("OPS Mode changed to SIM", "info");
        break;

      case "off":
        setOpsMode("OFF");
        output = ["🔴 OPS Mode set to OFF"];
        type = "success";
        addSystemLog("OPS Mode changed to OFF", "info");
        break;

      case "markets":
        output = [
          "Available Markets:",
          "  • BTC-PERP  (24h Vol: 125.3M)",
          "  • ETH-PERP  (24h Vol: 89.7M)",
          "  • SOL-PERP  (24h Vol: 45.2M)",
          "  • AVAX-PERP (24h Vol: 12.8M)",
          "  • MATIC-PERP (24h Vol: 8.4M)",
          "  • ARB-PERP  (24h Vol: 15.1M)",
        ];
        type = "success";
        break;

      case "backtest":
        if (args.length < 2) {
          output = ["Error: Usage: backtest <strategy> <market> [interval] [days]"];
          type = "error";
        } else {
          output = [
            `Running backtest: ${args[0]} on ${args[1]}...`,
            "This would trigger the LAB Terminal backtest runner.",
            "Navigate to LAB tab to see results.",
          ];
          type = "info";
          addSystemLog(`Backtest initiated: ${args[0]} on ${args[1]}`, "info");
        }
        break;

      case "mc":
        const runs = args[0] ? parseInt(args[0]) : 1000;
        output = [
          `Running Monte Carlo simulation with ${runs} runs...`,
          "This would trigger the Monte Carlo analysis.",
          "Navigate to LAB tab to see results.",
        ];
        type = "info";
        addSystemLog(`Monte Carlo started: ${runs} simulations`, "info");
        break;

      case "wf":
        if (args.length < 2) {
          output = ["Error: Usage: wf <strategy> <market>"];
          type = "error";
        } else {
          output = [
            `Running Walk-Forward analysis: ${args[0]} on ${args[1]}...`,
            "This would trigger the Walk-Forward analyzer.",
            "Navigate to LAB tab to see results.",
          ];
          type = "info";
          addSystemLog(`Walk-Forward started: ${args[0]} on ${args[1]}`, "info");
        }
        break;

      case "ev":
        if (args.length < 1) {
          output = ["Error: Usage: ev <market>"];
          type = "error";
        } else {
          const mockEv = (Math.random() * 0.3 - 0.1).toFixed(3);
          output = [
            `EV Calculation for ${args[0]}:`,
            `  Expected Value: ${mockEv}R`,
            `  Win Rate: ${(Math.random() * 20 + 40).toFixed(1)}%`,
            `  Avg Win: ${(Math.random() * 2 + 1).toFixed(2)}R`,
            `  Avg Loss: ${(Math.random() * -1.5 - 0.5).toFixed(2)}R`,
          ];
          type = parseFloat(mockEv) > 0 ? "success" : "error";
        }
        break;

      default:
        output = [`Unknown command: ${cmd}`, "Type 'help' for available commands"];
        type = "error";
    }

    // Add to command history
    setCommands(prev => [...prev, { input: cmdInput, output, type, timestamp }]);
    setInput("");
    setHistoryIndex(-1);
  };

  // Add system log
  const addSystemLog = (message: string, type: LogEntry["type"]) => {
    setSystemLogs(prev => [...prev, { message, type, timestamp: Date.now() }]);
  };

  // Handle keyboard events
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Up/Down for history
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const newIndex = Math.min(historyIndex + 1, commands.length - 1);
      setHistoryIndex(newIndex);
      if (commands[commands.length - 1 - newIndex]) {
        setInput(commands[commands.length - 1 - newIndex].input);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const newIndex = Math.max(historyIndex - 1, -1);
      setHistoryIndex(newIndex);
      if (newIndex === -1) {
        setInput("");
      } else if (commands[commands.length - 1 - newIndex]) {
        setInput(commands[commands.length - 1 - newIndex].input);
      }
    }
    // Tab for autocomplete
    else if (e.key === "Tab" && suggestions.length > 0) {
      e.preventDefault();
      setInput(suggestions[selectedSuggestion]);
      setSuggestions([]);
    }
    // Up/Down for suggestion selection
    else if (e.key === "ArrowUp" && suggestions.length > 0) {
      e.preventDefault();
      setSelectedSuggestion(prev => Math.max(0, prev - 1));
    } else if (e.key === "ArrowDown" && suggestions.length > 0) {
      e.preventDefault();
      setSelectedSuggestion(prev => Math.min(suggestions.length - 1, prev + 1));
    }
    // Enter to execute
    else if (e.key === "Enter") {
      e.preventDefault();
      executeCommand(input);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold cyber-title">CONSOLE</h1>
            <p className="text-[#2D8EDF] font-mono text-sm">Command interface and system logs</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#00f3ff] rounded-full cyber-lamp" />
            <span className="text-sm font-mono text-[#00f3ff] uppercase tracking-wider matrix-text">
              CONSOLE ACTIVE
            </span>
          </div>
        </div>

        {/* Command Terminal */}
        <Card className="relative">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                ⚡ Terminal
              </CardTitle>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setCommands([]);
                    addSystemLog("Console cleared by user", "info");
                  }}
                >
                  Clear
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => executeCommand("/help")}
                >
                  Help
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Output Area */}
            <div 
              ref={outputRef}
              className="h-96 overflow-y-auto mb-4 font-mono text-sm space-y-3 bg-[#050508] p-4 rounded-lg border border-[#1b2230]"
            >
              {commands.map((cmd, idx) => (
                <div key={idx} className="space-y-1">
                  {/* Input line */}
                  <div className="flex items-center gap-2">
                    <span className="text-[#2D8EDF]">{'>'}</span>
                    <span className="text-neutral-300">{cmd.input}</span>
                    <span className="text-neutral-600 text-xs ml-auto">
                      <Timestamp timestamp={cmd.timestamp} />
                    </span>
                  </div>
                  
                  {/* Output lines */}
                  <div className={cn(
                    "ml-4 space-y-1",
                    cmd.type === "success" && "text-[#16A34A]",
                    cmd.type === "error" && "text-[#F43F5E]",
                    cmd.type === "info" && "text-[#7FB7FF]"
                  )}>
                    {cmd.output.map((line, lineIdx) => (
                      <div key={lineIdx}>{line}</div>
                    ))}
                  </div>
                </div>
              ))}
              
              {commands.length === 0 && (
                <div className="text-neutral-500 text-center py-8">
                  <div className="mb-2">Welcome to Tacitus Quant Terminal Console</div>
                  <div className="text-xs">Type <span className="text-[#2D8EDF]">/help</span> or press <span className="text-[#2D8EDF]">Tab</span> for commands</div>
                </div>
              )}
            </div>

            {/* Autocomplete Suggestions */}
            {suggestions.length > 0 && (
              <div className="mb-2 bg-[#0a0a14] border border-[#6243DD] rounded-lg p-2 space-y-1">
                {suggestions.map((suggestion, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "px-3 py-1 rounded font-mono text-sm cursor-pointer transition-colors",
                      idx === selectedSuggestion
                        ? "bg-[#6243DD] text-white"
                        : "text-[#2D8EDF] hover:bg-[#6243DD]/20"
                    )}
                    onClick={() => {
                      setInput(suggestion);
                      setSuggestions([]);
                      inputRef.current?.focus();
                    }}
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            )}

            {/* Input Line */}
            <div className="flex items-center gap-2 bg-[#050508] p-3 rounded-lg border border-[#6243DD]/50 focus-within:border-[#2D8EDF]">
              <span className="text-[#2D8EDF] font-mono">{'>'}</span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type / for commands or press Tab..."
                className="flex-1 bg-transparent border-none outline-none text-neutral-200 font-mono placeholder:text-neutral-600"
              />
              <span className="text-[#2D8EDF] font-mono animate-pulse">█</span>
            </div>

            {/* Hints */}
            <div className="mt-3 flex items-center gap-4 text-xs text-neutral-500 font-mono">
              <div>↑↓ History</div>
              <div>Tab Autocomplete</div>
              <div>Enter Execute</div>
              <div className="ml-auto">
                {commands.length} commands
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Log */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                📋 System Log
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSystemLogs([])}
              >
                Clear
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 overflow-y-auto space-y-2 font-mono text-xs">
              {systemLogs.length === 0 ? (
                <div className="text-neutral-500 text-center py-8">
                  No system logs yet
                </div>
              ) : (
                systemLogs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2 pb-2 border-b border-neutral-800">
                    <span className={cn(
                      log.type === "success" && "text-[#16A34A]",
                      log.type === "warning" && "text-[#FFB020]",
                      log.type === "info" && "text-[#7FB7FF]",
                      log.type === "error" && "text-[#F43F5E]"
                    )}>
                      {log.type === "success" && "✓"}
                      {log.type === "warning" && "⚠"}
                      {log.type === "info" && "ℹ"}
                      {log.type === "error" && "✗"}
                    </span>
                    <div className="flex-1">
                      <span className="text-neutral-500">
                        [<Timestamp timestamp={log.timestamp} />]
                      </span>
                      <span className="ml-2 text-neutral-300">{log.message}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
