interface TelemetryStripProps {
  metrics: Record<string, string | number>;
}

export default function TelemetryStrip({ metrics }: TelemetryStripProps) {
  return (
    <div className="flex items-center space-x-6 border-b border-grid bg-panel px-4 py-2 text-xs">
      {Object.entries(metrics).map(([key, value]) => (
        <div key={key} className="flex items-center space-x-2">
          <span className="uppercase tracking-wider text-fg/60">{key}</span>
          <span className="font-semibold text-accent terminal-text">{value}</span>
        </div>
      ))}
    </div>
  );
}

