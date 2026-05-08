import Link from "next/link";
import { PlusCircle, PiggyBank } from "lucide-react";

export const metadata = {
  title: "Budgets - Cashflow",
};

export default function BudgetsPage() {
  return (
    <div className="space-y-5 sm:space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-4xl">Budgets</h1>
          <p className="mt-2 max-w-xl text-sm text-gray-500 sm:text-base">Set and monitor spending limits for each category in IDR</p>
        </div>
        <Link
          href="/dashboard/budgets/new"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800 sm:w-auto sm:px-6 sm:text-base"
        >
          <PlusCircle size={20} />
          Set Budget
        </Link>
      </div>

      {/* Empty State / Placeholder */}
      <div className="rounded-2xl border border-white/70 bg-white/60 p-5 shadow-xl backdrop-blur-xl sm:p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-4">
            <PiggyBank size={32} className="text-purple-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">No budgets created</h2>
          <p className="mt-2 max-w-md text-sm text-gray-500 sm:text-base">
            Create budgets to set spending limits for each category and track your financial goals in rupiah.
          </p>
          <Link
            href="/dashboard/budgets/new"
            className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800 sm:w-auto sm:px-6 sm:text-base"
          >
            Create Your First Budget
          </Link>
        </div>
      </div>
    </div>
  );
}
