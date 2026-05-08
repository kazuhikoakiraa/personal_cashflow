"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "~/lib/supabase/client";

type LogoutButtonProps = {
  compact?: boolean;
};

export function LogoutButton({ compact = false }: LogoutButtonProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const supabase = createClient();

      await supabase.auth.signOut();
      await new Promise((resolve) => setTimeout(resolve, 100));
      router.replace("/login");
      router.refresh();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className={
        compact
          ? "w-full inline-flex items-center justify-center rounded-xl border border-white/70 bg-white/70 p-2.5 text-gray-700 transition-colors hover:bg-red-50 hover:text-red-600"
          : "w-full inline-flex items-center gap-3 rounded-xl border border-white/70 bg-white/70 px-4 py-3 text-gray-700 transition-colors hover:bg-red-50 hover:text-red-600"
      }
      aria-label="Sign out"
      title="Sign out"
    >
      <LogOut size={20} />
      {!compact && "Sign Out"}
    </button>
  );
}
