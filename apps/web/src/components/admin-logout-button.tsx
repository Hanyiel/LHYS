"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { clearStoredAuth } from "@/lib/auth-storage";

export function AdminLogoutButton() {
  const router = useRouter();

  function handleLogout() {
    clearStoredAuth();
    router.replace("/login");
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="h-9 border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
      onClick={handleLogout}
    >
      退出登录
    </Button>
  );
}
