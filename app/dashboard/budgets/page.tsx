"use client";

import Link from "next/link";
import { PlusCircle, PiggyBank, Trash2, AlertTriangle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

export default function BudgetsPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const { data: budgets = [], isLoading, refetch } = trpc.budget.getByMonth.useQuery({ month, year });

  const deleteMutation = trpc.budget.delete.useMutation({
    onSuccess: () => refetch(),
  });

  const formatIDR = (amount: number | string) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(Number(amount));

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  return (
    <div className="space-y-5 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-4xl">Budgets</h1>
          <p className="mt-2 max-w-xl text-sm text-gray-500 sm:text-base">
            Set and monitor spending limits for each category in IDR
          </p>
        </div>
        <Link
          href="/dashboard/budgets/new"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800 sm:w-auto sm:px-6 sm:text-base"
        >
          <PlusCircle size={20} />
          Set Budget
        </Link>
      </div>

      {/* Month Selector */}
      <div className="flex items-center gap-3">
        <button onClick={prevMonth} className="px-3 py-2 rounded-xl border border-white/70 bg-white/60 hover:bg-white/80 text-sm font-semibold transition-colors">
          ←
        </button>
        <span className="font-semibold text-gray-900">{monthNames[month - 1]} {year}</span>
        <button onClick={nextMonth} className="px-3 py-2 rounded-xl border border-white/70 bg-white/60 hover:bg-white/80 text-sm font-semibold transition-colors">
          →
        </button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center p-12 text-gray-400">Loading...</div>
      ) : budgets.length === 0 ? (
        <div className="rounded-2xl border border-white/70 bg-white/60 p-5 shadow-xl backdrop-blur-xl sm:p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-4">
              <PiggyBank size={32} className="text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">No budgets for {monthNames[month - 1]} {year}</h2>
            <p className="mt-2 max-w-md text-sm text-gray-500 sm:text-base">
              Create budgets to set spending limits for each category and track your financial goals.
            </p>
            <Link
              href="/dashboard/budgets/new"
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
            >
              Create Your First Budget
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {budgets.map((budget) => {
            const spent = Number(budget.spent);
            const limit = Number(budget.limitAmount);
            const percent = budget.percentage;

            return (
              <div key={budget.id} className="rounded-2xl border border-white/70 bg-white/60 p-5 shadow-xl backdrop-blur-xl space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900">{budget.category.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{monthNames[month - 1]} {year}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {budget.isOverBudget && (
                      <span className="flex items-center gap-1 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold">
                        <AlertTriangle size={12} /> Over
                      </span>
                    )}
                    <button
                      onClick={() => deleteMutation.mutate({ categoryId: budget.categoryId, month, year })}
                      className="text-gray-300 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Spent: {formatIDR(spent)}</span>
                    <span className="font-semibold text-gray-900">Limit: {formatIDR(limit)}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${percent}%`,
                        backgroundColor: budget.isOverBudget ? "#ef4444" : percent > 80 ? "#f59e0b" : "#8b5cf6",
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 text-right">{percent.toFixed(1)}%</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}