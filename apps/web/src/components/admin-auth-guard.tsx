"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getCurrentAdmin } from "@/lib/admin-api";
import { clearStoredAuth, getStoredAuthToken } from "@/lib/auth-storage";

export function AdminAuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function verify() {
      const token = getStoredAuthToken();
      if (!token) {
        router.replace(`/login?from=${encodeURIComponent(pathname)}`);
        return;
      }

      try {
        await getCurrentAdmin();
        if (!cancelled) {
          setChecked(true);
        }
      } catch {
        clearStoredAuth();
        router.replace(`/login?from=${encodeURIComponent(pathname)}`);
      }
    }

    void verify();

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (!checked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50 text-sm text-zinc-500">
        正在验证登录状态...
      </div>
    );
  }

  return children;
}
