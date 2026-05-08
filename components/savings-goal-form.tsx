"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@/lib/trpc";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

const savingsGoalSchema = z.object({
  name: z.string().min(1, "Goal name is required").max(100),
  targetAmount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format"),
  deadline: z.string().optional(),
});

type SavingsGoalFormData = z.infer<typeof savingsGoalSchema>;

export function SavingsGoalForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SavingsGoalFormData>({
    resolver: zodResolver(savingsGoalSchema),
  });

  const createGoalMutation = trpc.savings.createGoal.useMutation({
    onSuccess: () => {
      reset();
      router.push("/dashboard/savings");
    },
    onError: (error) => {
      alert(`Error creating savings goal: ${error.message}`);
    },
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

  const onSubmit = async (data: SavingsGoalFormData) => {
    setIsSubmitting(true);
    try {
      await createGoalMutation.mutateAsync({
        name: data.name,
        targetAmount: data.targetAmount,
        deadline: data.deadline ? new Date(data.deadline) : undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.95),_rgba(226,232,240,0.65)_40%,_rgba(241,245,249,0.95))]">
      <div className="mx-auto max-w-4xl px-4 py-6 lg:py-8">
        {/* Back Link */}
        <Link
          href="/dashboard/savings"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Savings
        </Link>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">Create Savings Goal</h1>
          <p className="text-gray-600 mt-2 text-sm lg:text-base">Set a target and track your progress</p>
        </div>

        {/* Form Container */}
        <div className="rounded-[28px] border border-white/70 bg-white/55 p-6 lg:p-8 shadow-xl backdrop-blur-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Goal Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Goal Name *</label>
            <input type="text" placeholder="e.g., Summer Vacation, New Car" {...register("name")} className={inputClass} />
            {errors.name && <p className={errorClass}>{errors.name.message}</p>}
          </div>

          {/* Target Amount */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Target Amount * (IDR)</label>
            <input type="text" inputMode="numeric" placeholder="2500000" {...register("targetAmount")} className={inputClass} />
            <p className="mt-1 text-xs text-gray-500">Enter the target in rupiah.</p>
            {errors.targetAmount && <p className={errorClass}>{errors.targetAmount.message}</p>}
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Target Deadline (optional)</label>
            <input type="date" {...register("deadline")} className={inputClass} />
            {errors.deadline && <p className={errorClass}>{errors.deadline.message}</p>}
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting || createGoalMutation.isPending}
              className={btnPrimaryClass}
            >
              {isSubmitting || createGoalMutation.isPending ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Goal"
              )}
            </button>
            <Link href="/dashboard/savings" className={`${btnGhostClass} text-center`}>
              Cancel
            </Link>
          </div>
        </form>
      </div>
      </div>
    </div>
  );
}
