import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { createClient } from "~/lib/supabase/server";
import { ensureUserExists } from "~/server/ensure-user";
import { formatDate } from "~/lib/utils";

type DashboardTransaction = {
  category: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  date: string;
  note?: string;
};

const chartColors = ["#3B82F6", "#10B981", "#F59E0B", "#EC4899", "#8B5CF6", "#06B6D4"];

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfMonth(date: Date, offset = 0) {
  return new Date(date.getFullYear(), date.getMonth() - offset, 1);
}

function formatMonthLabel(date: Date) {
  return date.toLocaleString("id-ID", { month: "short" });
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure user exists in database
    await ensureUserExists(user.id, user.email || "", user.user_metadata?.full_name);

    // Ensure user has sensible default categories on first visit
    try {
      const existingCount = await db.category.count({ where: { userId: user.id } });
      if (existingCount === 0) {
        await db.category.createMany({
          data: [
            { userId: user.id, name: "Salary", type: "INCOME", icon: "wallet", color: "#10B981" },
            { userId: user.id, name: "Freelance", type: "INCOME", icon: "briefcase", color: "#06B6D4" },
            { userId: user.id, name: "Rent", type: "EXPENSE", icon: "home", color: "#F97316" },
            { userId: user.id, name: "Groceries", type: "EXPENSE", icon: "shopping-cart", color: "#F59E0B" },
            { userId: user.id, name: "Transport", type: "EXPENSE", icon: "car", color: "#8B5CF6" },
            { userId: user.id, name: "Utilities", type: "EXPENSE", icon: "cpu", color: "#EF4444" },
            { userId: user.id, name: "Entertainment", type: "EXPENSE", icon: "music", color: "#EC4899" },
            { userId: user.id, name: "Health", type: "EXPENSE", icon: "heart", color: "#F97316" },
            { userId: user.id, name: "Misc", type: "EXPENSE", icon: "dots-horizontal", color: "#6B7280" },
          ],
          skipDuplicates: true,
        });
      }
    } catch (catErr) {
      console.warn("Failed to ensure default categories:", catErr);
    }

    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const nextMonthStart = startOfMonth(now, -1);

    const transactions = await db.transaction.findMany({
      where: { userId: user.id },
      include: {
        category: true,
      },
      orderBy: { date: "desc" },
    });

    const savingsGoals = await db.savingsGoal.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    const currentMonthTransactions = transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= currentMonthStart && transactionDate < nextMonthStart;
    });

    const totalIncome = currentMonthTransactions
      .filter((transaction) => transaction.type === "INCOME")
      .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

    const totalExpense = currentMonthTransactions
      .filter((transaction) => transaction.type === "EXPENSE")
      .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

    const balance = totalIncome - totalExpense;

    const avgTransaction = currentMonthTransactions.length
      ? currentMonthTransactions.reduce((sum, transaction) => sum + Number(transaction.amount), 0) /
        currentMonthTransactions.length
      : 0;

    const recentTransactions: DashboardTransaction[] = transactions.slice(0, 5).map((transaction) => ({
      category: transaction.category.name,
      amount: Number(transaction.amount),
      type: transaction.type,
      date: formatDate(transaction.date),
      note: transaction.note ?? undefined,
    }));

    const spendingTrends = Array.from({ length: 7 }, (_, index) => {
      const day = new Date(now);
      day.setDate(now.getDate() - (6 - index));
      const dayStart = startOfDay(day);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const dayTransactions = currentMonthTransactions.filter((transaction) => {
        const transactionDate = new Date(transaction.date);
        return transactionDate >= dayStart && transactionDate < dayEnd;
      });

      const income = dayTransactions
        .filter((transaction) => transaction.type === "INCOME")
        .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

      const expense = dayTransactions
        .filter((transaction) => transaction.type === "EXPENSE")
        .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

      return {
        date: day.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        income,
        expense,
      };
    });

    const expenseByCategory = new Map<string, number>();
    currentMonthTransactions
      .filter((transaction) => transaction.type === "EXPENSE")
      .forEach((transaction) => {
        const categoryName = transaction.category.name;
        expenseByCategory.set(
          categoryName,
          (expenseByCategory.get(categoryName) ?? 0) + Number(transaction.amount)
        );
      });

    const categoryBreakdown = Array.from(expenseByCategory.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value], index) => ({
        name,
        value,
        color: chartColors[index % chartColors.length],
      }));

    const topCategory = categoryBreakdown[0]?.name ?? "No expenses yet";
    const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : "0.0";

    const savingsTotal = savingsGoals.reduce((sum, goal) => sum + Number(goal.currentAmount), 0);
    const savingsTarget = savingsGoals.reduce((sum, goal) => sum + Number(goal.targetAmount), 0);
    const savingsGoalPercent = savingsTarget > 0 ? Math.min((savingsTotal / savingsTarget) * 100, 100) : 0;

    return NextResponse.json({
      summary: {
        totalIncome,
        totalExpense,
        balance,
        savingsRate: `${savingsRate}%`,
        topCategory,
        avgTransaction,
        savingsGoalPercent,
      },
      recentTransactions,
      spendingTrends,
      categoryBreakdown,
      transactionCount: currentMonthTransactions.length,
    });
  } catch (error) {
    console.error("Dashboard summary failed:", error);
    return NextResponse.json(
      { error: "Failed to load dashboard summary" },
      { status: 500 }
    );
  }
}
