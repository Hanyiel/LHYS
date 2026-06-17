import { ProfileEditor } from "@/features/profile/profile-editor";

export default function AdminProfilePage() {
  return (
    <div className="px-5 py-6 sm:px-8 lg:px-10">
      <div className="border-b border-zinc-200 pb-6">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-emerald-700">
          Workspace
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-zinc-950">个人信息</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
          编辑公开展示的姓名、一寸照、个人介绍、项目经历、荣誉奖项、工作经历和作品链接。
        </p>
      </div>

      <div className="py-6">
        <ProfileEditor />
      </div>
    </div>
  );
}
