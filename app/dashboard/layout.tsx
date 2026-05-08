import Link from "next/link";
import type { ElementType } from "react";
import {
  LayoutDashboard,
  ArrowRightLeft,
  PiggyBank,
  Target,
} from "lucide-react";
import { LogoutButton } from "~/components/logout-button";
import { createClient } from "~/lib/supabase/server";

export const metadata = {
  title: "Cashflow - Personal Finance Tracker",
  description: "Track your income, expenses, and savings goals",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ??
    (user?.user_metadata?.name as string | undefined) ??
    user?.email ??
    "User";
  const userInitial = displayName.trim().charAt(0).toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.95),_rgba(226,232,240,0.65)_40%,_rgba(241,245,249,0.95))] text-gray-900">
      <div className="mx-auto flex min-h-screen max-w-[1600px] gap-2 p-2 sm:gap-5 sm:p-4 lg:p-6">
        <aside className="sticky top-2 flex h-[calc(100vh-1rem)] w-14 shrink-0 flex-col rounded-[22px] border border-white/70 bg-white/55 p-2 shadow-xl backdrop-blur-2xl sm:top-4 sm:h-[calc(100vh-2rem)] sm:w-72 sm:rounded-[28px] sm:p-5">
          <div className="flex items-center justify-center gap-3 px-0 sm:justify-start sm:px-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm sm:h-11 sm:w-11 sm:rounded-2xl">
              <span className="text-lg font-bold">₹</span>
            </div>
            <div className="hidden sm:block">
              <p className="text-lg font-semibold tracking-tight">Cashflow</p>
              <p className="text-xs text-gray-500">Personal finance planner</p>
            </div>
          </div>

          <nav className="mt-4 flex flex-1 flex-col gap-1.5 sm:mt-8 sm:gap-2">
            <SidebarLink href="/dashboard" icon={LayoutDashboard} label="Dashboard" />
            <SidebarLink href="/dashboard/transactions" icon={ArrowRightLeft} label="Transactions" />
            <SidebarLink href="/dashboard/budgets" icon={PiggyBank} label="Budgets" />
            <SidebarLink href="/dashboard/savings" icon={Target} label="Savings" />
          </nav>

          <div className="rounded-xl border border-white/70 bg-white/70 p-1.5 shadow-sm sm:rounded-2xl sm:p-4">
            <p className="hidden text-sm font-medium text-gray-900 sm:block">Ready to sign out?</p>
            <p className="hidden mt-1 text-xs text-gray-500 sm:block">Your session will end on this device.</p>
            <div className="mt-2 sm:mt-3">
              <div className="block sm:hidden">
                <LogoutButton compact />
              </div>
              <div className="hidden sm:block">
                <LogoutButton />
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="mb-3 rounded-[22px] border border-white/70 bg-white/55 px-3 py-3 shadow-lg backdrop-blur-2xl sm:mb-5 sm:rounded-[28px] sm:px-6 sm:py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-gray-500">Dashboard</p>
                <h1 className="mt-1 text-base sm:text-lg font-semibold text-gray-900 lg:text-xl">Financial overview</h1>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-2 sm:gap-3 rounded-full border border-white/70 bg-white/70 px-2 sm:px-3 py-1 sm:py-2 shadow-sm">
                  <div className="flex h-8 sm:h-9 w-8 sm:w-9 items-center justify-center rounded-full bg-gray-900 text-xs sm:text-sm font-semibold text-white shrink-0">
                    {userInitial}
                  </div>
                  <div className="text-left">
                    <p className="hidden text-xs uppercase tracking-[0.18em] text-gray-500 sm:block">Signed in as</p>
                    <p className="max-w-[110px] truncate text-xs font-semibold text-gray-900 sm:max-w-[220px] sm:text-sm">{displayName}</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <div className="pb-4 sm:pb-6 lg:pb-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

function SidebarLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: ElementType;
  label: string;
}) {
  return (
    <Link
      href={href}
      title={label}
      className="flex items-center justify-center gap-3 rounded-xl px-2 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-white/70 hover:text-gray-950 sm:justify-start sm:rounded-2xl sm:px-4 sm:py-3"
    >
      <Icon size={18} className="shrink-0" />
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}
