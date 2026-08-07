export default function Home() {
  return (
    <div className="flex min-h-screen bg-zinc-100">
      <aside className="w-64 bg-white p-6 border-r border-zinc-200">
        <h1 className="text-2xl font-bold mb-8">
          Trading Journal
        </h1>

        <nav className="flex flex-col gap-4">
          <a href="#" className="font-medium">
            Dashboard
          </a>

          <a href="#" className="text-zinc-600">
            Trades
          </a>

          <a href="#" className="text-zinc-600">
            Statistics
          </a>

          <a href="#" className="text-zinc-600">
            Import CSV
          </a>

          <a href="#" className="text-zinc-600">
            Account
          </a>
        </nav>
      </aside>

      <main className="flex-1 p-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">
              Dashboard
            </h2>

            <p className="text-zinc-600 mt-1">
              Overview of your trading performance.
            </p>
          </div>

          <button className="rounded-lg bg-black px-5 py-3 text-white">
            + Add Trade
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 mt-8 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl bg-white p-5 border border-zinc-200">
            <p className="text-sm text-zinc-500">Total R</p>
            <p className="text-2xl font-bold mt-2">+12.4R</p>
          </div>

          <div className="rounded-xl bg-white p-5 border border-zinc-200">
            <p className="text-sm text-zinc-500">Win Rate</p>
            <p className="text-2xl font-bold mt-2">58%</p>
          </div>

          <div className="rounded-xl bg-white p-5 border border-zinc-200">
            <p className="text-sm text-zinc-500">Average R</p>
            <p className="text-2xl font-bold mt-2">0.62R</p>
          </div>

          <div className="rounded-xl bg-white p-5 border border-zinc-200">
            <p className="text-sm text-zinc-500">Total Trades</p>
            <p className="text-2xl font-bold mt-2">20</p>
          </div>
        </div>

        <div className="mt-8 rounded-xl bg-white p-6 border border-zinc-200">
          <h3 className="text-xl font-semibold">Equity Curve</h3>
          <p className="text-zinc-500 mt-2">
            Chart coming soon.
          </p>
        </div>

      </main>
    </div>
  );
}