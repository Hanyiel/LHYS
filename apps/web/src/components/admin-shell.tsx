import Link from "next/link";
import type { ReactNode } from "react";
import { AdminLogoutButton } from "@/components/admin-logout-button";

const adminSections = [
  {
    title: "工作台",
    items: [
      { href: "/admin", label: "概览" },
      { href: "/admin/users", label: "管理员管理" },
      { href: "/admin/profile", label: "个人资料" },
    ],
  },
  {
    title: "产品管理",
    items: [
      { href: "/admin/products/servers", label: "服务器管理" },
      { href: "/admin/products/domains", label: "域名管理" },
    ],
  },
];

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="grid min-h-screen lg:grid-cols-[248px_1fr]">
        <aside className="flex border-b border-white/10 bg-zinc-950 px-5 py-5 lg:flex-col lg:border-b-0 lg:border-r">
          <div className="flex w-full flex-col">
            <Link href="/" className="block text-lg font-semibold">
              LHYS Admin
            </Link>
            <nav className="mt-8 grid gap-6 text-sm text-zinc-300">
              {adminSections.map((section) => (
                <div key={section.title}>
                  <p className="px-3 text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                    {section.title}
                  </p>
                  <div className="mt-2 grid gap-1">
                    {section.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="rounded-md px-3 py-2 transition hover:bg-white/10 hover:text-white"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </div>

          <div className="mt-auto pt-6">
            <AdminLogoutButton />
          </div>
        </aside>
        <main className="bg-stone-50 text-zinc-950">{children}</main>
      </div>
    </div>
  );
}
