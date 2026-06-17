"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  createAdminUser,
  listAdminUsers,
  type AdminUser,
} from "@/lib/admin-api";

const defaultForm = {
  username: "",
  password: "",
  displayName: "",
  email: "",
  enabled: true,
};

export function AdminUsersPanel() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [form, setForm] = useState(defaultForm);

  async function refreshUsers() {
    setLoading(true);
    setError("");

    try {
      setUsers(await listAdminUsers());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "无法加载管理员列表");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function loadInitialUsers() {
      try {
        const nextUsers = await listAdminUsers();
        if (!cancelled) {
          setUsers(nextUsers);
        }
      } catch (cause) {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : "无法加载管理员列表");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadInitialUsers();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      await createAdminUser({
        username: form.username.trim(),
        password: form.password,
        displayName: form.displayName.trim(),
        email: form.email.trim() || undefined,
        enabled: form.enabled,
      });
      setMessage("管理员已添加");
      setForm(defaultForm);
      await refreshUsers();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "添加失败");
    } finally {
      setSubmitting(false);
    }
  }

  const hasUsers = useMemo(() => users.length > 0, [users]);

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <form
        className="rounded-md border border-zinc-200 bg-white p-6 shadow-sm"
        onSubmit={handleSubmit}
      >
        <h2 className="text-lg font-semibold text-zinc-950">添加管理员</h2>

        <div className="mt-5 grid gap-4">
          <label className="grid gap-2 text-sm font-medium text-zinc-700">
            管理员账号
            <input
              value={form.username}
              onChange={(event) =>
                setForm((current) => ({ ...current, username: event.target.value }))
              }
              className="h-11 rounded-md border border-zinc-300 px-3 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950"
              placeholder="admin01"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-zinc-700">
            登录密码
            <input
              type="password"
              value={form.password}
              onChange={(event) =>
                setForm((current) => ({ ...current, password: event.target.value }))
              }
              className="h-11 rounded-md border border-zinc-300 px-3 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950"
              placeholder="至少 8 位"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-zinc-700">
            显示名称
            <input
              value={form.displayName}
              onChange={(event) =>
                setForm((current) => ({ ...current, displayName: event.target.value }))
              }
              className="h-11 rounded-md border border-zinc-300 px-3 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950"
              placeholder="管理员"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-zinc-700">
            邮箱
            <input
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({ ...current, email: event.target.value }))
              }
              className="h-11 rounded-md border border-zinc-300 px-3 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950"
              placeholder="admin@example.com"
            />
          </label>

          <label className="flex items-center gap-2 text-sm font-medium text-zinc-700">
            <input
              type="checkbox"
              checked={form.enabled}
              onChange={(event) =>
                setForm((current) => ({ ...current, enabled: event.target.checked }))
              }
              className="size-4 rounded border-zinc-300"
            />
            启用账号
          </label>

          {error ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          {message ? (
            <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {message}
            </p>
          ) : null}

          <Button type="submit" className="h-11" disabled={submitting}>
            {submitting ? "保存中..." : "添加管理员"}
          </Button>
        </div>
      </form>

      <section className="rounded-md border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-950">管理员列表</h2>
          <p className="text-sm text-zinc-500">{users.length} 条记录</p>
        </div>

        <div className="mt-5 overflow-hidden rounded-md border border-zinc-200">
          <table className="min-w-full divide-y divide-zinc-200 text-left text-sm">
            <thead className="bg-zinc-50 text-zinc-600">
              <tr>
                <th className="px-4 py-3 font-medium">账号</th>
                <th className="px-4 py-3 font-medium">显示名</th>
                <th className="px-4 py-3 font-medium">邮箱</th>
                <th className="px-4 py-3 font-medium">状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr>
                  <td className="px-4 py-4 text-zinc-500" colSpan={4}>
                    正在加载...
                  </td>
                </tr>
              ) : hasUsers ? (
                users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 py-4 font-medium text-zinc-950">
                      {user.username}
                    </td>
                    <td className="px-4 py-4 text-zinc-700">{user.displayName}</td>
                    <td className="px-4 py-4 text-zinc-700">{user.email ?? "-"}</td>
                    <td className="px-4 py-4 text-zinc-700">
                      {user.enabled ? "启用" : "停用"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-4 py-4 text-zinc-500" colSpan={4}>
                    还没有管理员记录
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
