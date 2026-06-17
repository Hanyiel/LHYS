import { DomainProductsPanel } from "@/features/products/domain-products-panel";

export default function DomainManagementPage() {
  return (
    <div className="px-5 py-6 sm:px-8 lg:px-10">
      <div className="border-b border-zinc-200 pb-6">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-emerald-700">
          Product
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-zinc-950">域名管理</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
          用于后续维护域名、解析记录、证书状态和关联服务。
        </p>
      </div>

      <div className="py-6">
        <DomainProductsPanel />
      </div>
    </div>
  );
}
