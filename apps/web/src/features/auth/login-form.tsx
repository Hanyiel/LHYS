"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { loginAdmin } from "@/lib/admin-api";
import { setStoredAuth } from "@/lib/auth-storage";

export function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await loginAdmin({ username, password });
      setStoredAuth(result.token, result.user);

      const params = new URLSearchParams(window.location.search);
      const from = params.get("from");
      router.push(from && from.startsWith("/admin") ? from : "/admin");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "登录失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-md border border-zinc-200 bg-white p-6 shadow-sm"
    >
      <div className="grid gap-5">
        <label className="grid gap-2 text-sm font-medium text-zinc-700">
          账号
          <input
            type="text"
            name="username"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="请输入管理员账号"
            className="h-11 rounded-md border border-zinc-300 px-3 text-base outline-none transition placeholder:text-zinc-400 focus:border-zinc-950"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-zinc-700">
          密码
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="请输入密码"
            className="h-11 rounded-md border border-zinc-300 px-3 text-base outline-none transition placeholder:text-zinc-400 focus:border-zinc-950"
          />
        </label>

        {error ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <Button type="submit" className="h-11" disabled={loading}>
          {loading ? "登录中..." : "登录"}
        </Button>
      </div>
    </form>
  );
}
