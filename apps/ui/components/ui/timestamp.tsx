"use client";

import { useEffect, useState } from "react";

interface TimestampProps {
  timestamp: number;
  className?: string;
}

export function Timestamp({ timestamp, className }: TimestampProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={className}>--:--:--Z</div>;
  }

  const formattedTime = new Date(timestamp).toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }) + "Z";

  return <div className={className}>{formattedTime}</div>;
}
