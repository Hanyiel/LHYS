import { AdminUsersPanel } from "@/features/admin-users/admin-users-panel";

export default function AdminUsersPage() {
  return (
    <div className="px-5 py-6 sm:px-8 lg:px-10">
      <div className="border-b border-zinc-200 pb-6">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-emerald-700">
          Workspace
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-zinc-950">管理员管理</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
          在这里新增管理员账号并设置登录密码，密码会在后端加密后存入数据库。
        </p>
      </div>

      <div className="py-6">
        <AdminUsersPanel />
      </div>
    </div>
  );
}
