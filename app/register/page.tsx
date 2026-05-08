"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, LogIn, AlertCircle, CheckCircle, Sparkles, ShieldCheck, ArrowRight } from "lucide-react";
import { createClient } from "~/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!fullName.trim()) {
      setError("Full name is required");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (signUpError) throw signUpError;

      if (data.session) {
        setSuccess("Account created. Redirecting to dashboard...");
        setTimeout(() => {
          router.replace("/dashboard");
          router.refresh();
        }, 1200);
      } else {
        setSuccess("Account created. Please check your email, then sign in.");
        setTimeout(() => {
          router.replace("/login");
          router.refresh();
        }, 1600);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.95),_rgba(226,232,240,0.8)_35%,_rgba(224,242,254,0.92))] px-4 py-6 text-gray-900">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-5xl items-center gap-6 rounded-[32px] border border-white/70 bg-white/35 p-4 shadow-2xl backdrop-blur-2xl lg:p-6">
        <div className="hidden flex-1 flex-col justify-between rounded-[28px] border border-white/60 bg-gradient-to-br from-gray-950 via-slate-900 to-slate-700 p-8 text-white shadow-xl lg:flex">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
              <Sparkles size={14} />
              Separate accounts, safe data
            </div>
            <h1 className="mt-6 max-w-md text-4xl font-semibold tracking-tight">
              Create an account to manage your own cashflow.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-white/70">
              Each account gets isolated categories, transactions, budgets, and savings goals.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <ShieldCheck className="mb-3 text-emerald-300" size={18} />
              <p className="font-medium">Scoped by userId</p>
              <p className="mt-1 text-xs text-white/60">No cross-user data leakage</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <ArrowRight className="mb-3 text-sky-300" size={18} />
              <p className="font-medium">Fast sign-in ready</p>
              <p className="mt-1 text-xs text-white/60">Light, professional UI</p>
            </div>
          </div>
        </div>

        <div className="w-full max-w-md rounded-[28px] border border-white/70 bg-white/75 p-6 shadow-xl backdrop-blur-xl lg:p-8">
          <div className="mb-8 flex items-center justify-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-950 text-white shadow-sm">
              <span className="text-lg font-bold">₹</span>
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Cashflow</h1>
              <p className="text-xs text-gray-500">Personal finance planner</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-950">Create a new account</h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">Sign up to track transactions, budgets, and savings in IDR.</p>
          </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/90 p-4">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-medium text-rose-900">Registration failed</p>
              <p className="mt-1 text-sm text-rose-700">{error}</p>
            </div>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4">
            <CheckCircle className="text-emerald-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-medium text-emerald-900">Success</p>
              <p className="mt-1 text-sm text-emerald-700">{success}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-5">
          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="mb-2 block text-sm font-medium text-gray-900">
              Full name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3.5 text-gray-400" size={18} />
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                required
                className="w-full rounded-2xl border border-gray-200 bg-white/90 py-3 pl-10 pr-4 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-900">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-2xl border border-gray-200 bg-white/90 py-3 pl-10 pr-4 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-900">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                className="w-full rounded-2xl border border-gray-200 bg-white/90 py-3 pl-10 pr-4 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-900 mb-2"
            >
              Confirm password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your password"
                required
                className="w-full rounded-2xl border border-gray-200 bg-white/90 py-3 pl-10 pr-4 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
              />
            </div>
          </div>

          {/* Sign Up Button */}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-950 px-6 py-3 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <LogIn size={20} />
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-sm text-gray-500">Already have an account?</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        {/* Sign In Link */}
        <Link
          href="/login"
          className="flex w-full items-center justify-center rounded-2xl border border-gray-200 bg-white/80 px-6 py-3 font-semibold text-gray-900 transition hover:bg-gray-50"
        >
          Sign in
        </Link>
      </div>
      </div>
    </div>
  );
}
