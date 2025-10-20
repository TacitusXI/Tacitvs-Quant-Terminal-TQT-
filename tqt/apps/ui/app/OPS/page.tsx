export default function OPS() {
  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">OPS — Live Terminal</h1>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-2xl p-4 shadow bg-neutral-900 text-neutral-100">
          <h2 className="font-medium mb-2">Tables</h2>
          <ul className="text-sm space-y-2">
            <li>BTC-PERP — <span className="text-green-400">EV ON</span></li>
            <li>ETH-PERP — <span className="text-yellow-400">EV ~0</span></li>
          </ul>
        </div>
        <div className="rounded-2xl p-4 shadow bg-neutral-900 text-neutral-100">
          <h2 className="font-medium mb-2">Controls</h2>
          <div className="space-x-2">
            <button className="px-3 py-2 rounded-xl bg-emerald-600">ARM</button>
            <button className="px-3 py-2 rounded-xl bg-amber-600">HOLD</button>
            <button className="px-3 py-2 rounded-xl bg-sky-600">SIM</button>
          </div>
        </div>
        <div className="rounded-2xl p-4 shadow bg-neutral-900 text-neutral-100">
          <h2 className="font-medium mb-2">Ops Log</h2>
          <pre className="text-xs">
{`14:31Z | BTC-PERP | TORTOISE | ENTRY L | R_$=120 | EV=+0.16 | maker`}
          </pre>
        </div>
      </div>
    </main>
  );
}
