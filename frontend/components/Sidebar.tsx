import Link from "next/link";

type SidebarProps = {
    userEmail: string | null;
    onLogout: () => void;
};

export default function Sidebar({
    userEmail,
    onLogout,
}: SidebarProps) {
    return (
        <aside className="w-64 bg-white p-6 border-r border-zinc-200">
            <h1 className="text-2xl font-bold mb-8">
                Trading Journal
            </h1>

            <div className="mb-6 border-b border-zinc-200 pb-4">
                <p className="text-sm text-zinc-600">
                    {userEmail}
                </p>

                <button
                    onClick={onLogout}
                    className="mt-2 cursor-pointer text-sm text-zinc-500 hover:text-black"
                >
                    Sign Out
                </button>
            </div>

            <nav className="flex flex-col gap-4">
                <Link href="/" className="font-medium">
                    Dashboard
                </Link>

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

                <Link href="/settings" className="text-zinc-600">
                    Settings
                </Link>
            </nav>
        </aside>
    );
}