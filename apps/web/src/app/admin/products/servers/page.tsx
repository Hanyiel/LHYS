import { ServerProductsPanel } from "@/features/products/server-products-panel";

export default function ServerManagementPage() {
  return (
    <div className="px-5 py-6 sm:px-8 lg:px-10">
      <div className="border-b border-zinc-200 pb-6">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-emerald-700">
          Product
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-zinc-950">服务器管理</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
          用于后续维护服务器信息、部署状态、访问地址和备注。
        </p>
      </div>

      <div className="py-6">
        <ServerProductsPanel />
      </div>
    </div>
  );
}
