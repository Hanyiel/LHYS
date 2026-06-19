"use client";

import { useEffect, useState } from "react";
import { 
  Mail, 
  MapPin, 
  ExternalLink, 
  Briefcase, 
  Trophy, 
  Link as LinkIcon, 
  Code2,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { getPublicProfileByAdminUserId } from "@/lib/public-profile-api";
import type { PublicProfile } from "@/lib/public-profile-api";
import type { ProjectExperience, SkillItem } from "@/lib/profile-api";

import { Skeleton } from "@/components/ui/skeleton";

const publicProfileAdminUserId = 1; // 你的ID
const fallbackName = "SuperLHY";
const tocSections = [
  { id: "about", label: "个人简介" },
  { id: "skills", label: "专业技能" },
  { id: "projects", label: "项目经历" },
  { id: "honors", label: "荣誉奖项" },
  { id: "links", label: "作品链接" },
];

export default function Home() {
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    getPublicProfileByAdminUserId(publicProfileAdminUserId)
      .then((nextProfile) => {
        if (active) setProfile(nextProfile);
      })
      .catch((cause) => {
        if (active) setError(cause instanceof Error ? cause.message : "无法加载个人资料");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const avatarUrl = absoluteAssetUrl(profile?.profile.avatarUrl);
  const displayName = profile?.profile.realName ?? fallbackName;
  const headline = profile?.profile.headline ?? "全栈开发者，专注于前后端协同、数据组织与个人作品展示。";
  const skillItems = profile?.skillItems ?? [];
  const legacySkillsText = profile?.skillsText ?? "";

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-zinc-950 selection:bg-zinc-200 pb-32">
      <SiteHeader />
      
      {/* 悬浮侧边导航栏 (大屏幕时显示) */}
      {!loading && !error && <TableOfContents />}

      <main className="mx-auto max-w-4xl px-6 pt-12 md:pt-20 lg:px-8 relative">
        {error && (
          <div className="mb-10 rounded-sm border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <ProfileSkeleton />
        ) : (
          <div className="space-y-24">
            
            {/* ==================== 1. 顶部基础信息 & 关于我 ==================== */}
            <section id="about" className="scroll-mt-32 flex flex-col-reverse items-start justify-between gap-10 sm:flex-row sm:gap-16">
              <div className="flex-1 space-y-6 w-full">
                <div className="space-y-3">
                  <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-zinc-900">
                    {displayName}
                  </h1>
                  <p className="text-lg text-zinc-600 font-medium">
                    {headline}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-5 pt-3">
                    {profile?.profile.location && (
                      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500">
                        <MapPin className="size-4" />
                        {profile.profile.location}
                      </span>
                    )}
                    {profile?.profile.email && (
                      <a href={`mailto:${profile.profile.email}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">
                        <Mail className="size-4" />
                        {profile.profile.email}
                      </a>
                    )}
                  </div>
                </div>

                {/* 优化: 缩小字体至 text-base, 减小行高至 leading-7, 缓解高度失衡 */}
                {profile?.introduction?.trim() && (
                  <div className="pt-6 border-t border-zinc-200/60">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">
                      关于我 / About Me
                    </h2>
                    <p className="text-base text-zinc-700 leading-7 whitespace-pre-wrap">
                      {profile.introduction}
                    </p>
                  </div>
                )}
              </div>
              
              {/* 头像 */}
              {avatarUrl && (
                <div className="shrink-0 w-[120px] sm:w-[160px] lg:w-[180px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={avatarUrl} 
                    alt={displayName} 
                    className="w-full h-auto object-contain rounded-sm"
                  />
                </div>
              )}
            </section>

            <hr className="border-zinc-200/60" />

            {/* ==================== 2. 全上下单栏瀑布流 ==================== */}
            <div className="space-y-24">
              
              {/* --- 模块一：专业技能 (去框化，条状感) --- */}
              <section id="skills" className="scroll-mt-32 space-y-6">
                <div className="flex items-center gap-3 pb-2">
                  <Code2 className="size-6 text-zinc-900" />
                  <h2 className="text-2xl font-bold tracking-tight">专业技能</h2>
                </div>
                
                {!skillItems.length && !legacySkillsText.trim() ? (
                  <EmptyState hint="暂无技能描述" />
                ) : skillItems.length ? (
                  <div className="flex flex-col border-t border-zinc-200/60 divide-y divide-zinc-200/60">
                    {skillItems.map((item) => (
                      <SkillStrip key={item.id} item={item} />
                    ))}
                  </div>
                ) : (
                  <div className="border-t border-zinc-200/60 pt-6">
                    <p className="text-base text-zinc-700 leading-7 whitespace-pre-wrap">
                      {legacySkillsText}
                    </p>
                  </div>
                )}
              </section>

              {/* --- 模块二：项目经历 --- */}
              <section id="projects" className="scroll-mt-32 space-y-6">
                <div className="flex items-center gap-3 pb-2">
                  <Briefcase className="size-6 text-zinc-900" />
                  <h2 className="text-2xl font-bold tracking-tight">项目经历</h2>
                </div>
                
                {!profile?.projects.length ? (
                  <EmptyState hint="暂无项目经历" />
                ) : (
                  <div className="grid gap-12">
                    {profile.projects.map((item) => (
                      <ProjectCard key={item.id} item={item} />
                    ))}
                  </div>
                )}
              </section>

              {/* --- 模块三：荣誉奖项 --- */}
              <section id="honors" className="scroll-mt-32 space-y-6">
                <div className="flex items-center gap-3 pb-2">
                  <Trophy className="size-6 text-zinc-900" />
                  <h2 className="text-2xl font-bold tracking-tight">荣誉奖项</h2>
                </div>
                {!profile?.honors.length ? (
                  <EmptyState hint="暂无荣誉奖项" />
                ) : (
                  // 奖项保留微卡片感，更像荣誉证书的陈列
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                    {profile.honors.map((item) => (
                      <div key={item.id} className="group flex flex-col p-5 rounded-sm border border-zinc-200/80 bg-white hover:border-zinc-400 transition-colors">
                        <h3 className="font-bold text-base text-zinc-900 leading-tight">
                          {item.awardName}
                        </h3>
                        <p className="text-sm text-zinc-500 mt-1.5">
                          {item.awardLevel ?? item.awardedDate ?? ""}
                        </p>
                        {item.certificatePdfUrl && (
                          <a 
                            href={item.certificatePdfUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-sm font-semibold text-zinc-900 hover:text-zinc-600 transition-colors mt-3 inline-flex items-center"
                          >
                            查看证书 <ExternalLink className="ml-1 size-3.5" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* --- 模块四：作品链接 (全局同步为条状明文) --- */}
              <section id="links" className="scroll-mt-32 space-y-6">
                <div className="flex items-center gap-3 pb-2">
                  <LinkIcon className="size-6 text-zinc-900" />
                  <h2 className="text-2xl font-bold tracking-tight">作品与链接</h2>
                </div>
                
                {!profile?.links.length ? (
                  <EmptyState hint="暂无作品链接" />
                ) : (
                  <div className="flex flex-col border-t border-zinc-200/60 divide-y divide-zinc-200/60">
                    {profile.links.map((item) => (
                      <a 
                        key={item.id} 
                        href={item.linkUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="group flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-4 hover:bg-zinc-50/50 transition-colors px-2 -mx-2 rounded-sm"
                      >
                        <div className="flex items-center gap-3">
                          <ExternalLink className="size-4 text-zinc-400 group-hover:text-zinc-900 transition-colors" />
                          <span className="font-semibold text-base text-zinc-900 group-hover:underline underline-offset-4">
                            {item.linkName}
                          </span>
                        </div>
                        <span className="text-sm font-mono text-zinc-500 group-hover:text-zinc-700 break-all sm:text-right">
                          {item.linkUrl}
                        </span>
                      </a>
                    ))}
                  </div>
                )}
              </section>

            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// ---------------- Helper Components ----------------

function TableOfContents() {
  const [activeId, setActiveId] = useState<string>("about");

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150; 
      const current = [...tocSections].reverse().find(({ id }) => {
        const element = document.getElementById(id);
        if (element) {
          return element.offsetTop <= scrollPosition;
        }
        return false;
      });

      if (current) {
        setActiveId(current.id);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <nav className="hidden xl:flex flex-col gap-2.5 fixed top-1/3 right-12 2xl:right-24 z-10">
      {tocSections.map(({ id, label }) => {
        const isActive = activeId === id;
        return (
          <button
            key={id}
            onClick={() => scrollToSection(id)}
            className={`text-sm font-medium text-left px-4 py-1.5 border-l-2 transition-all duration-200 ${
              isActive
                ? "border-zinc-900 text-zinc-900"
                : "border-transparent text-zinc-400 hover:text-zinc-600 hover:border-zinc-300"
            }`}
          >
            {label}
          </button>
        );
      })}
    </nav>
  );
}

function absoluteAssetUrl(value: string | null | undefined) {
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  const backendBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"; 
  const path = value.startsWith("/") ? value : `/${value}`;
  return `${backendBaseUrl}${path}`;
}

function EmptyState({ hint }: { hint: string }) {
  return (
    <div className="rounded-sm border border-dashed border-zinc-300 py-10 text-center text-sm text-zinc-500">
      {hint}
    </div>
  );
}

// 全新重构的专业技能条状组件 (List Strip Layout)
function SkillStrip({ item }: { item: SkillItem }) {
  return (
    <article className="flex flex-col sm:flex-row gap-2 sm:gap-6 py-5 hover:bg-zinc-50/50 transition-colors px-2 -mx-2 rounded-sm">
      <h3 className="text-base font-bold text-zinc-900 shrink-0 sm:w-48 pt-1">
        {item.skillName}
      </h3>
      {item.skillDescription?.trim() ? (
        <p className="whitespace-pre-wrap text-base leading-7 text-zinc-700 flex-1">
          {item.skillDescription}
        </p>
      ) : null}
    </article>
  );
}

function ProjectCard({ item }: { item: ProjectExperience }) {
  const projectLinks = item.projectLinks?.length
    ? item.projectLinks
    : item.repositoryUrl
      ? [
          {
            id: 0,
            projectId: item.id,
            linkName: "项目源码 / Repository",
            linkUrl: item.repositoryUrl,
            sortOrder: 0,
            visible: true,
          },
        ]
      : [];

  return (
    <article className="rounded-sm border border-zinc-200/80 bg-white p-7 sm:p-9 transition-colors hover:border-zinc-400">
      
      {/* 头部：标题与时间 */}
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between border-b border-zinc-100 pb-5">
        <h3 className="text-2xl font-bold leading-tight text-zinc-900">
          {item.projectName}
        </h3>
        {item.periodText && (
          <span className="shrink-0 text-sm font-mono font-medium text-zinc-500">
            {item.periodText}
          </span>
        )}
      </div>

      {/* 职责说明 */}
      {item.roleDescription?.trim() && (
        <div className="mb-6">
          <p className="text-base text-zinc-800 leading-7">
            <span className="font-bold text-zinc-900 mr-2">个人职责:</span>
            {item.roleDescription}
          </p>
        </div>
      )}

      {/* 简介与贡献 */}
      <div className="grid gap-8 sm:grid-cols-2">
        <ProjectDetail label="项目简介" value={item.projectSummary} />
        <ProjectDetail label="个人贡献" value={item.personalContribution} />
      </div>

      {/* 底部链接：全新的一条条明文列表展示 */}
      {projectLinks.length ? (
        <div className="mt-8 border-t border-zinc-100 pt-5">
          <div className="flex flex-col gap-3">
            {projectLinks.map((link) => (
              <a
                key={`${link.id}-${link.linkUrl}`}
                href={link.linkUrl}
                target="_blank"
                rel="noreferrer"
                className="group flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 hover:bg-zinc-50/80 p-2 -ml-2 rounded-sm transition-colors"
              >
                <div className="flex items-center gap-2 shrink-0">
                  <LinkIcon className="size-4 text-zinc-400 group-hover:text-zinc-900 transition-colors" />
                  <span className="font-bold text-sm text-zinc-900 group-hover:underline underline-offset-4">
                    {link.linkName}:
                  </span>
                </div>
                <span className="text-sm font-mono text-zinc-500 break-all group-hover:text-zinc-700">
                  {link.linkUrl}
                </span>
              </a>
            ))}
          </div>
        </div>
      ) : null}
    </article>
  );
}

function ProjectDetail({ label, value }: { label: string; value: string | null | undefined; }) {
  if (!value?.trim()) return null;

  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-sm font-bold text-zinc-900">
        {label}
      </h4>
      <p className="whitespace-pre-wrap text-base leading-7 text-zinc-700">
        {value}
      </p>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-24 animate-pulse">
      <div className="flex flex-col-reverse items-start justify-between gap-10 sm:flex-row sm:gap-16">
        <div className="flex-1 space-y-5 w-full">
          <Skeleton className="h-10 w-2/3 max-w-md rounded-sm" />
          <Skeleton className="h-5 w-full max-w-sm rounded-sm" />
          <div className="flex gap-4 pt-2">
            <Skeleton className="h-5 w-24 rounded-sm" />
            <Skeleton className="h-5 w-40 rounded-sm" />
          </div>
          <div className="pt-6 border-t border-zinc-200/60">
            <Skeleton className="h-3 w-20 mb-4 rounded-sm" />
            <Skeleton className="h-24 w-full rounded-sm" />
          </div>
        </div>
        <Skeleton className="h-[160px] w-[120px] sm:h-[220px] sm:w-[160px] shrink-0 rounded-sm" />
      </div>
      <hr className="border-zinc-200/60" />
      
      <div className="space-y-24">
        <div className="space-y-6">
          <Skeleton className="h-8 w-32 rounded-sm" />
          <div className="border-t border-zinc-200/60 pt-6 space-y-4">
             <Skeleton className="h-6 w-full rounded-sm" />
             <Skeleton className="h-6 w-full rounded-sm" />
          </div>
        </div>
        <div className="space-y-6">
          <Skeleton className="h-8 w-32 rounded-sm" />
          <Skeleton className="h-64 w-full rounded-sm" />
          <Skeleton className="h-64 w-full rounded-sm" />
        </div>
      </div>
    </div>
  );
}