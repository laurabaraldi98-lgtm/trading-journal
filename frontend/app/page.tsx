export default function Home() {
  return (
    <div className="flex min-h-screen bg-zinc-100">
      <aside className="w-64 bg-white p-6 border-r border-zinc-200">
        <h1 className="text-2xl font-bold mb-8">Trading Journal</h1>

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
            <h2 className="text-3xl font-bold">Dashboard</h2>
            <p className="text-zinc-600 mt-1">
              Overview of your trading performance.
            </p>
          </div>

          <button className="rounded-lg bg-black px-5 py-3 text-white">
            + Add Trade
          </button>
        </div>
      </main>
    </div>
  );
}