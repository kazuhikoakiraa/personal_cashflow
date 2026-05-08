"use client";

import Link from "next/link";
import { PlusCircle, ArrowRightLeft, Trash2, TrendingUp, TrendingDown } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

export default function TransactionsPage() {
  const [typeFilter, setTypeFilter] = useState<"INCOME" | "EXPENSE" | undefined>(undefined);

  const { data, isLoading, refetch } = trpc.transaction.list.useQuery({
    limit: 50,
    offset: 0,
    type: typeFilter,
  });

  const deleteMutation = trpc.transaction.delete.useMutation({
    onSuccess: () => refetch(),
  });

  const transactions = data?.transactions ?? [];

  const formatIDR = (amount: number | string) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(Number(amount));

  const formatDate = (date: string | Date) =>
    new Date(date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="space-y-5 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-4xl">Transactions</h1>
          <p className="mt-2 max-w-xl text-sm text-gray-500 sm:text-base">
            Manage and track all your income and expenses in IDR
          </p>
        </div>
        <Link
          href="/dashboard/transactions/new"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800 sm:w-auto sm:px-6 sm:text-base"
        >
          <PlusCircle size={20} />
          New Transaction
        </Link>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {[undefined, "INCOME", "EXPENSE"].map((f) => (
          <button
            key={f ?? "ALL"}
            onClick={() => setTypeFilter(f as any)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              typeFilter === f
                ? "bg-gray-900 text-white"
                : "bg-white/60 border border-white/70 text-gray-600 hover:bg-white/80"
            }`}
          >
            {f ?? "All"}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="rounded-2xl border border-white/70 bg-white/60 shadow-xl backdrop-blur-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center p-12 text-gray-400">Loading...</div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
              <ArrowRightLeft size={32} className="text-indigo-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">No transactions yet</h2>
            <p className="mt-2 max-w-md text-sm text-gray-500">
              Start tracking your finances by creating your first transaction.
            </p>
            <Link
              href="/dashboard/transactions/new"
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
            >
              Create First Transaction
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {transactions.map((tx) => (
              <li key={tx.id} className="flex items-center justify-between px-5 py-4 hover:bg-white/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    tx.type === "INCOME" ? "bg-emerald-100" : "bg-red-100"
                  }`}>
                    {tx.type === "INCOME"
                      ? <TrendingUp size={18} className="text-emerald-600" />
                      : <TrendingDown size={18} className="text-red-500" />
                    }
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{tx.category.name}</p>
                    <p className="text-xs text-gray-400">{formatDate(tx.date)}{tx.note ? ` · ${tx.note}` : ""}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-bold text-sm ${tx.type === "INCOME" ? "text-emerald-600" : "text-red-500"}`}>
                    {tx.type === "INCOME" ? "+" : "-"}{formatIDR(tx.amount)}
                  </span>
                  <button
                    onClick={() => deleteMutation.mutate(tx.id)}
                    className="text-gray-300 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {data && data.total > 0 && (
        <p className="text-xs text-gray-400 text-center">{data.total} total transactions</p>
      )}
    </div>
  );
}