"use client";

import { useEffect, useState, type ElementType } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency, getCurrentMonth, getMonthName } from "~/lib/utils";
import {
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Sparkles,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  Activity,
  ArrowRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type DashboardTransaction = {
  category: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  date: string;
  note?: string;
};

type DashboardData = {
  summary: {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    savingsRate: string;
    topCategory: string;
    avgTransaction: number;
    savingsGoalPercent: number;
  };
  recentTransactions: DashboardTransaction[];
  spendingTrends: Array<{ date: string; income: number; expense: number }>;
  transactionCount: number;
};

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: ElementType;
}) {
  return (
    <div className="rounded-2xl border border-white/60 bg-white/60 p-5 shadow-sm backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
          <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
        </div>
        <div className="rounded-2xl bg-gray-900/5 p-3 text-gray-700">
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

function TransactionRow({ transaction }: { transaction: DashboardTransaction }) {
  const isIncome = transaction.type === "INCOME";
  const Icon = isIncome ? ArrowUpRight : ArrowDownRight;

  return (
    <div className="flex items-center justify-between border-b border-white/50 py-4 last:border-0">
      <div className="flex items-center gap-3">
        <div className={`rounded-full p-2 ${isIncome ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"}`}>
          <Icon size={16} />
        </div>
        <div>
          <p className="font-medium text-gray-900">{transaction.category}</p>
          <p className="text-xs text-gray-500">{transaction.note || transaction.date}</p>
        </div>
      </div>
      <p className={`font-semibold ${isIncome ? "text-emerald-600" : "text-rose-600"}`}>
        {isIncome ? "+" : "-"}
        {formatCurrency(transaction.amount)}
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-28 rounded-3xl border border-white/50 bg-white/50 backdrop-blur-xl" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl border border-white/50 bg-white/50 backdrop-blur-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="h-72 rounded-3xl border border-white/50 bg-white/50 backdrop-blur-xl xl:col-span-8" />
        <div className="h-72 rounded-3xl border border-white/50 bg-white/50 backdrop-blur-xl xl:col-span-4" />
      </div>
    </div>
  );
}

function EmptyState({ title }: { title: string }) {
  return (
    <div className="flex h-[260px] items-center justify-center rounded-2xl border border-dashed border-white/70 bg-white/40 text-center text-gray-500 backdrop-blur-sm">
      <div>
        <Activity className="mx-auto mb-3 text-gray-400" size={24} />
        <p className="font-medium text-gray-700">{title}</p>
        <p className="mt-1 text-sm text-gray-500">Add transactions to unlock live analytics</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const currentMonth = getCurrentMonth();
  const monthName = getMonthName(currentMonth.month);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/dashboard/summary", {
          credentials: "include",
        });
        const rawText = await response.text();
        const payload = rawText ? JSON.parse(rawText) : null;

        if (response.status === 401) {
          router.replace("/login");
          return;
        }

        if (!response.ok) {
          throw new Error(payload?.error || "Failed to load dashboard data");
        }

        if (mounted) {
          setData(payload as DashboardData);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Failed to load dashboard data");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [router]);

  if (loading) return <LoadingState />;

  if (error) {
    return (
      <div className="rounded-2xl border border-white/70 bg-white/70 p-8 shadow-xl backdrop-blur-xl">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-rose-100 p-3 text-rose-600">
            <AlertCircle size={20} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Unable to load dashboard</h2>
            <p className="mt-2 text-gray-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-800"
            >
              <RefreshCw size={16} />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const summary = data!.summary;
  const trend = data!.spendingTrends;
  const recentTransactions = data!.recentTransactions;

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-white/70 bg-white/55 p-6 shadow-xl backdrop-blur-2xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/60 px-3 py-1 text-xs font-medium text-gray-700">
              <Sparkles size={14} />
              Real-time overview
            </div>
            <h1 className="mt-3 text-3xl font-bold text-gray-900 lg:text-4xl">Dashboard</h1>
            <p className="mt-2 max-w-2xl text-sm text-gray-600 lg:text-base">
              Clean, lightweight, production-ready snapshot for {monthName} {currentMonth.year}.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm text-gray-700 lg:min-w-[380px]">
            <MetaChip label="Transactions" value={`${data!.transactionCount}`} />
            <MetaChip label="Top category" value={summary.topCategory} />
            <MetaChip label="Avg txn" value={formatCurrency(summary.avgTransaction)} />
            <MetaChip label="Savings" value={summary.savingsRate} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Income" value={formatCurrency(summary.totalIncome)} subtitle="Current month" icon={Wallet} />
        <StatCard title="Expenses" value={formatCurrency(summary.totalExpense)} subtitle="Current month" icon={TrendingUp} />
        <StatCard title="Balance" value={formatCurrency(summary.balance)} subtitle="Computed from DB" icon={Wallet} />
        <StatCard title="Savings" value={summary.savingsRate} subtitle="Efficiency rate" icon={Sparkles} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="xl:col-span-8 rounded-[28px] border border-white/70 bg-white/60 p-6 shadow-xl backdrop-blur-xl">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">7-day trend</h2>
            <span className="text-xs font-medium text-gray-500">Income vs expense</span>
          </div>
          {trend.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255,255,255,0.9)",
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                    backdropFilter: "blur(12px)",
                  }}
                />
                <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="No transactions in the last 7 days" />
          )}
        </div>

        <div className="xl:col-span-4 rounded-[28px] border border-white/70 bg-white/60 p-6 shadow-xl backdrop-blur-xl">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Quick insights</h2>
            <TrendingUp size={18} className="text-gray-500" />
          </div>

          <div className="space-y-3">
            <InsightRow title="Top category" value={summary.topCategory} />
            <InsightRow title="Average transaction" value={formatCurrency(summary.avgTransaction)} />
            <InsightRow title="Savings goal" value={`${summary.savingsGoalPercent.toFixed(0)}% reached`} />
            <InsightRow title="Loaded items" value={`${data!.transactionCount} transactions`} />
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-white/70 bg-white/60 p-6 shadow-xl backdrop-blur-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Recent activity</h2>
          <span className="text-sm text-gray-500">Real database data</span>
        </div>

        {recentTransactions.length ? (
          <div>
            {recentTransactions.map((transaction, index) => (
              <TransactionRow key={index} transaction={transaction} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/70 bg-white/40 p-10 text-center text-gray-500 backdrop-blur-sm">
            No transactions yet. Create one to unlock the dashboard.
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-800">
            View all
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function MetaChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/70 bg-white/60 p-3 shadow-sm backdrop-blur-sm">
      <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function InsightRow({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/70 bg-white/55 p-4 shadow-sm backdrop-blur-sm">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-gray-500">{title}</p>
      <p className="mt-2 text-sm font-semibold text-gray-900">{value}</p>
    </div>
  );
}
