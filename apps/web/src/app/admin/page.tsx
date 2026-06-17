import Link from "next/link";

const dashboardItems = [
  { label: "管理员", value: "可管理", note: "已接入新增管理员和列表查看" },
  { label: "个人资料", value: "可编辑", note: "支持基础资料、一寸照、简介、经历和链接" },
  { label: "系统状态", value: "正常", note: "前端、后端、数据库已连通" },
];

const nextModules = ["服务器管理", "域名管理", "公开页面 SEO", "客户端扩展"];

export default function AdminPage() {
  return (
    <div className="px-5 py-6 sm:px-8 lg:px-10">
      <div className="flex flex-col gap-3 border-b border-zinc-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-emerald-700">
            Workspace
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-zinc-950">
            管理员工作台
          </h1>
        </div>
        <p className="text-sm text-zinc-500">本地开发环境</p>
      </div>

      <section className="grid gap-4 py-6 md:grid-cols-3">
        {dashboardItems.map((item) => (
          <article
            key={item.label}
            className="rounded-md border border-zinc-200 bg-white p-5"
          >
            <p className="text-sm text-zinc-500">{item.label}</p>
            <p className="mt-3 text-2xl font-semibold text-zinc-950">
              {item.value}
            </p>
            <p className="mt-3 text-sm leading-6 text-zinc-600">{item.note}</p>
          </article>
        ))}
      </section>

      <section className="border-t border-zinc-200 py-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-zinc-950">核心功能</h2>
            <p className="mt-2 text-sm text-zinc-600">
              目前已接入管理员账号、个人资料维护，并预留产品管理入口。
            </p>
          </div>
          <Link
            href="/admin/users"
            className="rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
          >
            管理员管理
          </Link>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {nextModules.map((module) => (
            <div
              key={module}
              className="rounded-md border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-700"
            >
              {module}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
