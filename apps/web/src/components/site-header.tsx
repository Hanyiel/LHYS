import Link from "next/link";

const navItems = [
  { href: "/", label: "个人简介" },
  { href: "/login", label: "管理员登录" },
  { href: "/admin", label: "工作台" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-zinc-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="text-base font-semibold text-zinc-950">
          LHYS
        </Link>
        <nav className="flex items-center gap-2 text-sm text-zinc-600">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 transition hover:bg-zinc-100 hover:text-zinc-950"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
