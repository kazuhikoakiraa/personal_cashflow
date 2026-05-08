"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@/lib/trpc";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

const budgetSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  limitAmount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format"),
  month: z.number().min(1).max(12),
  year: z.number().min(2000),
});

type BudgetFormData = z.infer<typeof budgetSchema>;

export function BudgetForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const now = new Date();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    },
  });

  // Fetch categories (expense only for budgets)
  const { data: categories = [] } = trpc.category.list.useQuery({
    type: "EXPENSE",
  });

  const inputClass =
    "w-full rounded-2xl border border-white/70 bg-white/60 backdrop-blur py-3 px-4 outline-none transition focus:border-white focus:ring-4 focus:ring-white/20 focus:bg-white/80";
  const selectClass =
    "w-full rounded-2xl border border-white/70 bg-white/60 backdrop-blur py-3 px-4 outline-none transition focus:border-white focus:ring-4 focus:ring-white/20 focus:bg-white/80 appearance-none";
  const btnPrimaryClass =
    "flex-1 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2";
  const btnGhostClass =
    "px-6 py-3 border border-white/70 bg-white/40 hover:bg-white/60 text-gray-900 rounded-2xl font-semibold transition-colors backdrop-blur";
  const errorClass = "text-red-600 text-sm mt-1";

  // Create budget mutation
  const upsertMutation = trpc.budget.upsert.useMutation({
    onSuccess: () => {
      reset();
      router.push("/dashboard/budgets");
    },
    onError: (error) => {
      alert(`Error creating budget: ${error.message}`);
    },
  });

  const onSubmit = async (data: BudgetFormData) => {
    setIsSubmitting(true);
    try {
      await upsertMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.95),_rgba(226,232,240,0.65)_40%,_rgba(241,245,249,0.95))]">
      <div className="mx-auto max-w-4xl px-4 py-6 lg:py-8">
        {/* Back Link */}
        <Link
          href="/dashboard/budgets"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Budgets
        </Link>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">Set Budget</h1>
          <p className="text-gray-600 mt-2 text-sm lg:text-base">Create a spending limit for a category</p>
        </div>

        {/* Form Container */}
        <div className="rounded-[28px] border border-white/70 bg-white/55 p-6 lg:p-8 shadow-xl backdrop-blur-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Category *
            </label>
            <select
              {...register("categoryId")}
              className={selectClass}
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="text-red-600 text-sm mt-1">{errors.categoryId.message}</p>
            )}
          </div>

          {/* Limit Amount */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Monthly Limit * (IDR)</label>
            <input type="text" inputMode="numeric" placeholder="1000000" {...register("limitAmount")} className={inputClass} />
            <p className="mt-1 text-xs text-gray-500">Use rupiah values only, without decimals if possible.</p>
            {errors.limitAmount && <p className={errorClass}>{errors.limitAmount.message}</p>}
          </div>

          {/* Month & Year */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Month *
              </label>
              <select
                {...register("month", { valueAsNumber: true })}
                className={selectClass}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {new Date(2024, m - 1).toLocaleString("id-ID", { month: "long" })}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Year *
              </label>
              <select
                {...register("year", { valueAsNumber: true })}
                className={selectClass}
              >
                {Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i).map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting || upsertMutation.isPending}
              className={btnPrimaryClass}
            >
              {isSubmitting || upsertMutation.isPending ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Creating...
                </>
              ) : (
                "Set Budget"
              )}
            </button>
            <Link
              href="/dashboard/budgets"
              className={`${btnGhostClass} text-center`}
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
      </div>
    </div>
  );
}
