import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { LoginForm } from "@/features/auth/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      <SiteHeader />
      <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center px-5 py-12">
        <section className="grid w-full gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-emerald-700">
              Admin
            </p>
            <h1 className="mt-4 text-3xl font-semibold text-zinc-950 sm:text-4xl">
              管理员登录
            </h1>
            <p className="mt-5 max-w-md text-base leading-8 text-zinc-600">
              登录后进入个人工作台，先从管理员管理开始，后续再逐步扩展内容、媒体和权限模块。
            </p>
          </div>

          <div>
            <LoginForm />
            <div className="mt-5 text-sm text-zinc-500">
              <Link href="/" className="font-medium text-zinc-800 hover:text-zinc-950">
                返回个人简介
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
