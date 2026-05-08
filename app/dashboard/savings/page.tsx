"use client";

import Link from "next/link";
import { PlusCircle, Target, Trash2, Plus } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

export default function SavingsPage() {
  const { data: goals = [], isLoading, refetch } = trpc.savings.listGoals.useQuery({
    includeCompleted: true,
  });

  const deleteMutation = trpc.savings.deleteGoal.useMutation({
    onSuccess: () => refetch(),
  });

  const [depositAmounts, setDepositAmounts] = useState<Record<string, string>>({});

  const addDepositMutation = trpc.savings.addDeposit.useMutation({
    onSuccess: () => refetch(),
  });

  const formatIDR = (amount: number | string) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(Number(amount));

  return (
    <div className="space-y-5 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-4xl">Savings Goals</h1>
          <p className="mt-2 max-w-xl text-sm text-gray-500 sm:text-base">
            Create and track your savings targets in IDR
          </p>
        </div>
        <Link
          href="/dashboard/savings/new"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800 sm:w-auto sm:px-6 sm:text-base"
        >
          <PlusCircle size={20} />
          Create Goal
        </Link>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center p-12 text-gray-400">Loading...</div>
      ) : goals.length === 0 ? (
        <div className="rounded-2xl border border-white/70 bg-white/60 p-5 shadow-xl backdrop-blur-xl sm:p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
              <Target size={32} className="text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">No savings goals yet</h2>
            <p className="mt-2 max-w-md text-sm text-gray-500 sm:text-base">
              Start saving by creating a goal. Set targets, track progress, and celebrate milestones in rupiah.
            </p>
            <Link
              href="/dashboard/savings/new"
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
            >
              Create Your First Goal
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {goals.map((goal) => {
            const current = Number(goal.currentAmount);
            const target = Number(goal.targetAmount);
            const percent = target > 0 ? Math.min((current / target) * 100, 100) : 0;

            return (
              <div key={goal.id} className="rounded-2xl border border-white/70 bg-white/60 p-5 shadow-xl backdrop-blur-xl space-y-4">
                {/* Goal Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900">{goal.name}</h3>
                    {goal.deadline && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        Target: {new Date(goal.deadline).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {goal.isCompleted && (
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">Done</span>
                    )}
                    <button
                      onClick={() => deleteMutation.mutate(goal.id)}
                      className="text-gray-300 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{formatIDR(current)}</span>
                    <span className="font-semibold text-gray-900">{formatIDR(target)}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 text-right">{percent.toFixed(1)}%</p>
                </div>

                {/* Add Deposit */}
                {!goal.isCompleted && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="Tambah deposit..."
                      value={depositAmounts[goal.id] ?? ""}
                      onChange={(e) => setDepositAmounts((prev) => ({ ...prev, [goal.id]: e.target.value }))}
                      className="flex-1 rounded-xl border border-white/70 bg-white/60 px-3 py-2 text-sm outline-none focus:border-gray-300"
                    />
                    <button
                      onClick={() => {
                        const amount = depositAmounts[goal.id];
                        if (!amount || isNaN(Number(amount))) return;
                        addDepositMutation.mutate({ goalId: goal.id, amount });
                        setDepositAmounts((prev) => ({ ...prev, [goal.id]: "" }));
                      }}
                      className="px-3 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}