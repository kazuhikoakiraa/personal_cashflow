"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ElementType } from "react";
import {
  LayoutDashboard,
  ArrowRightLeft,
  PiggyBank,
  Target,
  Menu,
  X,
} from "lucide-react";
import { LogoutButton } from "~/components/logout-button";

type DashboardShellProps = {
  displayName: string;
  userInitial: string;
  children: React.ReactNode;
};

export function DashboardShell({ displayName, userInitial, children }: DashboardShellProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.95),_rgba(226,232,240,0.65)_40%,_rgba(241,245,249,0.95))] text-gray-900">
      <div className="mx-auto min-h-screen max-w-[1600px] p-2 sm:p-4 lg:p-6">
        <div className="relative min-h-[calc(100vh-1rem)] sm:flex sm:gap-5">
          <div
            className={`fixed inset-0 z-40 bg-gray-900/30 backdrop-blur-sm transition-opacity sm:hidden ${
              isMobileMenuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <aside
            className={`fixed left-2 top-2 bottom-2 z-50 w-64 rounded-[24px] border border-white/70 bg-white/70 p-4 shadow-xl backdrop-blur-2xl transition-transform sm:sticky sm:top-4 sm:left-auto sm:bottom-auto sm:z-auto sm:h-[calc(100vh-2rem)] sm:w-72 sm:shrink-0 sm:rounded-[28px] sm:p-5 ${
              isMobileMenuOpen ? "translate-x-0" : "-translate-x-[115%]"
            } sm:translate-x-0`}
          >
            <div className="flex items-center gap-3 px-2">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gray-900 text-white shadow-sm">
                <span className="text-lg font-bold">₹</span>
              </div>
              <div>
                <p className="text-lg font-semibold tracking-tight">Cashflow</p>
                <p className="text-xs text-gray-500">Personal finance planner</p>
              </div>
            </div>

            <nav className="mt-8 flex flex-1 flex-col gap-2">
              <SidebarLink href="/dashboard" icon={LayoutDashboard} label="Dashboard" />
              <SidebarLink href="/dashboard/transactions" icon={ArrowRightLeft} label="Transactions" />
              <SidebarLink href="/dashboard/budgets" icon={PiggyBank} label="Budgets" />
              <SidebarLink href="/dashboard/savings" icon={Target} label="Savings" />
            </nav>

            <div className="mt-6 rounded-2xl border border-white/70 bg-white/70 p-4 shadow-sm">
              <p className="text-sm font-medium text-gray-900">Ready to sign out?</p>
              <p className="mt-1 text-xs text-gray-500">Your session will end on this device.</p>
              <div className="mt-3">
                <LogoutButton />
              </div>
            </div>
          </aside>

          <main className="min-w-0 flex-1">
            <header className="mb-3 rounded-[22px] border border-white/70 bg-white/55 px-3 py-3 shadow-lg backdrop-blur-2xl sm:mb-5 sm:rounded-[28px] sm:px-6 sm:py-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsMobileMenuOpen((open) => !open)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/70 bg-white/70 text-gray-700 shadow-sm transition-colors hover:bg-white sm:hidden"
                    aria-label="Toggle navigation menu"
                  >
                    {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
                  </button>

                  <div>
                    <p className="text-xs font-medium text-gray-500">Dashboard</p>
                    <h1 className="mt-0.5 text-base font-semibold text-gray-900 sm:text-lg lg:text-xl">Financial overview</h1>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-2 py-1 shadow-sm sm:gap-3 sm:px-3 sm:py-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-900 text-xs font-semibold text-white sm:h-9 sm:w-9 sm:text-sm">
                    {userInitial}
                  </div>
                  <div className="text-left">
                    <p className="hidden text-xs text-gray-500 sm:block">Signed in as</p>
                    <p className="max-w-[110px] truncate text-xs font-semibold text-gray-900 sm:max-w-[220px] sm:text-sm">{displayName}</p>
                  </div>
                </div>
              </div>
            </header>

            <div className="pb-4 sm:pb-6 lg:pb-8">{children}</div>
          </main>
        </div>
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
      className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-white/70 hover:text-gray-950"
    >
      <Icon size={18} className="shrink-0" />
      <span>{label}</span>
    </Link>
  );
}