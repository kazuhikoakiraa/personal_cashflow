"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@/lib/trpc";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

const transactionSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format"),
  type: z.enum(["INCOME", "EXPENSE"]),
  date: z.string().optional(),
  note: z.string().max(500, "Note must be 500 characters or less").optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

export function TransactionForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedType, setSelectedType] = useState<"INCOME" | "EXPENSE">("EXPENSE");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "EXPENSE",
      date: new Date().toISOString().split("T")[0],
    },
  });

  // Fetch categories based on selected type
  const { data: categories = [] } = trpc.category.list.useQuery({
    type: selectedType,
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

  // Create transaction mutation
  const createMutation = trpc.transaction.create.useMutation({
    onSuccess: () => {
      reset();
      router.push("/dashboard/transactions");
    },
    onError: (error) => {
      alert(`Error creating transaction: ${error.message}`);
    },
  });

  const onSubmit = async (data: TransactionFormData) => {
    setIsSubmitting(true);
    try {
      await createMutation.mutateAsync({
        ...data,
        type: selectedType,
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
          href="/dashboard/transactions"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Transactions
        </Link>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">New Transaction</h1>
          <p className="text-gray-600 mt-2 text-sm lg:text-base">Record income or expense</p>
        </div>

        {/* Form Container */}
        <div className="rounded-[28px] border border-white/70 bg-white/55 p-6 lg:p-8 shadow-xl backdrop-blur-2xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Transaction Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Type *
            </label>
            <div className="grid grid-cols-2 gap-3 sm:flex sm:gap-4">
              {['INCOME', 'EXPENSE'].map((type) => {
                const isSel = selectedType === type;
                const stateClasses = isSel
                  ? type === 'INCOME'
                    ? 'border-emerald-500 bg-emerald-500/20 backdrop-blur'
                    : 'border-red-500 bg-red-500/20 backdrop-blur'
                  : 'border-white/50 bg-white/30 hover:bg-white/50 backdrop-blur';
                return (
                  <label
                    key={type}
                    className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl border-2 cursor-pointer transition-all font-medium ${stateClasses}`}
                  >
                    <input
                      type="radio"
                      value={type}
                      checked={isSel}
                      onChange={(e) => setSelectedType(e.target.value as "INCOME" | "EXPENSE")}
                      className="w-4 h-4"
                    />
                    <span>{type}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Amount * (IDR)</label>
            <input type="text" inputMode="numeric" placeholder="50000" {...register("amount")} className={inputClass} />
            <p className="mt-1 text-xs text-gray-500">Enter the value in rupiah, without the currency symbol.</p>
            {errors.amount && <p className={errorClass}>{errors.amount.message}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Category *
            </label>
            <select {...register("categoryId")} className={selectClass}>
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.categoryId && <p className={errorClass}>{errors.categoryId.message}</p>}
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Date
            </label>
            <input type="date" {...register("date")} className={inputClass} />
            {errors.date && <p className={errorClass}>{errors.date.message}</p>}
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Note (optional)
            </label>
            <textarea placeholder="Add notes for this transaction..." {...register("note")} rows={4} className={inputClass} />
            {errors.note && <p className={errorClass}>{errors.note.message}</p>}
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting || createMutation.isPending}
              className={btnPrimaryClass}
            >
              {isSubmitting || createMutation.isPending ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Transaction"
              )}
            </button>
            <Link href="/dashboard/transactions" className={`${btnGhostClass} text-center`}>
              Cancel
            </Link>
          </div>
        </form>
      </div>
      </div>
    </div>
  );
}
