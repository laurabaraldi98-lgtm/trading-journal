import Link from "next/link";
import {
    ChartNoAxesCombined,
    LayoutDashboard,
    List,
    BarChart3,
    Upload,
    Wallet,
    Settings,
    LogOut,
} from "lucide-react";

type SidebarProps = {
    userEmail: string | null;
    onLogout: () => void;
};

export default function Sidebar({
    userEmail,
    onLogout,
}: SidebarProps) {
    return (
        <aside className="w-64 shrink-0 border-r border-slate-200 bg-white px-5 py-7">
            <div className="mb-8 flex items-center gap-3 px-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <ChartNoAxesCombined size={22} />
                </div>

                <div>
                    <h1 className="text-lg font-bold text-slate-900">
                        Trading Journal
                    </h1>

                    <p className="text-xs text-slate-500">
                        Performance tracker
                    </p>
                </div>
            </div>

            <nav className="flex flex-col gap-2">
                <Link
                    href="/"
                    className="flex items-center gap-3 rounded-xl bg-blue-50 px-4 py-3 font-medium text-blue-600"
                >
                    <LayoutDashboard size={20} />
                    Dashboard
                </Link>

                <Link
                    href="/trades"
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                >
                    <List size={20} />
                    Trades
                </Link>

                <a
                    href="#"
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                >
                    <BarChart3 size={20} />
                    Statistics
                </a>

                <a
                    href="#"
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                >
                    <Upload size={20} />
                    Import CSV
                </a>

                <a
                    href="#"
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                >
                    <Wallet size={20} />
                    Account
                </a>

                <Link
                    href="/settings"
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                >
                    <Settings size={20} />
                    Settings
                </Link>
            </nav>

            <div className="mt-8 border-t border-slate-200 px-2 pt-5">
                <p className="truncate text-xs text-slate-500">
                    {userEmail}
                </p>

                <button
                    type="button"
                    onClick={onLogout}
                    className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-slate-500 transition hover:text-slate-900"
                >
                    <LogOut size={16} />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}