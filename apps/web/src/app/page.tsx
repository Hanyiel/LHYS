import Image from "next/image";
import { ChevronRight, Mail, MapPin, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { getPublicProfileByAdminUserId } from "@/lib/public-profile-api";

const publicProfileAdminUserId = 1;
const fallbackName = "SuperLHY";
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export default async function Home() {
  const profile = await getPublicProfileByAdminUserId(publicProfileAdminUserId).catch(() => null);
  const avatarUrl = absoluteAssetUrl(profile?.profile.avatarUrl);
  const displayName = profile?.profile.realName ?? fallbackName;

  return (
    <div className="min-h-screen bg-zinc-50">
      <SiteHeader />
      <main>
        <section className="border-b border-zinc-200 bg-white">
          <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-[minmax(0,1fr)_180px] md:items-center lg:grid-cols-[minmax(0,1fr)_240px] lg:py-16">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-[0.18em] text-emerald-700">
                <Sparkles className="size-4" />
                个人简介
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl font-semibold text-zinc-950 sm:text-5xl">
                  {displayName}
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-zinc-600">
                  {profile?.profile.headline ??
                    "全栈开发者，专注于前后端协同、数据组织与个人作品展示。"}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-600">
                  {profile?.profile.location ? (
                    <span className="inline-flex items-center gap-2">
                      <MapPin className="size-4" />
                      {profile.profile.location}
                    </span>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-600">
                  {profile?.profile.email ? (
                    <a
                      href={`mailto:${profile.profile.email}`}
                      className="inline-flex items-center gap-2 hover:text-zinc-950"
                    >
                      <Mail className="size-4" />
                      {profile.profile.email}
                    </a>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="flex justify-center md:justify-end">
              {avatarUrl ? (
                <div className="relative h-48 w-36 overflow-hidden">
                  <Image
                    src={avatarUrl}
                    alt={displayName}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <TextSection
          title="个人简介"
          text={profile?.introduction}
          emptyHint="暂无个人简介"
        />

        <TextSection title="专业技能" text={profile?.skillsText} emptyHint="暂无技能描述" />

        <section className="mx-auto max-w-6xl px-5 py-10">
          <div className="grid gap-4 md:grid-cols-3">
            <InfoCard title="项目经历" value={`${profile?.projects.length ?? 0}`} note="可持续增加多条项目记录" />
            <InfoCard title="荣誉奖项" value={`${profile?.honors.length ?? 0}`} note="展示证书和奖项级别" />
            <InfoCard title="作品链接" value={`${profile?.links.length ?? 0}`} note="GitHub、主页和其他入口" />
          </div>
        </section>

        <Section title="项目经历" empty={!(profile?.projects.length)} emptyHint="暂无项目经历">
          <div className="grid gap-4">
            {profile?.projects.map((item) => (
              <RecordCard
                key={item.id}
                title={item.projectName}
                subtitle={item.periodText ?? "项目"}
                description={item.projectSummary ?? item.roleDescription ?? item.personalContribution ?? ""}
                footer={item.repositoryUrl ?? ""}
              />
            ))}
          </div>
        </Section>

        <Section title="荣誉奖项" empty={!(profile?.honors.length)} emptyHint="暂无荣誉奖项">
          <div className="grid gap-4 md:grid-cols-2">
            {profile?.honors.map((item) => (
              <RecordCard
                key={item.id}
                title={item.awardName}
                subtitle={item.awardLevel ?? item.awardedDate ?? ""}
                description={item.certificatePdfUrl ? "证书可点击查看" : ""}
                footer={item.certificatePdfUrl ?? ""}
              />
            ))}
          </div>
        </Section>

        <Section title="作品链接" empty={!(profile?.links.length)} emptyHint="暂无作品链接">
          <div className="grid gap-3 md:grid-cols-2">
            {profile?.links.map((item) => (
              <a
                key={item.id}
                href={item.linkUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-md border border-zinc-200 bg-white px-4 py-4 transition hover:border-zinc-950"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-950">{item.linkName}</p>
                  <p className="mt-1 break-all text-xs text-zinc-500">{item.linkUrl}</p>
                </div>
                <ChevronRight className="size-4 text-zinc-400" />
              </a>
            ))}
          </div>
        </Section>
      </main>
    </div>
  );
}

function absoluteAssetUrl(value: string | null | undefined) {
  if (!value) {
    return "";
  }
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }
  return `${apiBaseUrl}${value.startsWith("/") ? value : `/${value}`}`;
}

function InfoCard({
  title,
  value,
  note,
}: {
  title: string;
  value: string;
  note: string;
}) {
  return (
    <article className="rounded-md border border-zinc-200 bg-white p-5">
      <p className="text-sm text-zinc-500">{title}</p>
      <p className="mt-3 text-3xl font-semibold text-zinc-950">{value}</p>
      <p className="mt-3 text-sm leading-6 text-zinc-600">{note}</p>
    </article>
  );
}

function TextSection({
  title,
  text,
  emptyHint,
}: {
  title: string;
  text: string | null | undefined;
  emptyHint: string;
}) {
  return (
    <Section title={title} empty={!text?.trim()} emptyHint={emptyHint}>
      <p className="whitespace-pre-wrap text-sm leading-7 text-zinc-700">{text}</p>
    </Section>
  );
}

function Section({
  title,
  empty,
  emptyHint,
  children,
}: {
  title: string;
  empty: boolean;
  emptyHint: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto max-w-6xl px-5 py-8">
      <div className="mb-4 flex items-end justify-between gap-4">
        <h2 className="text-xl font-semibold text-zinc-950">{title}</h2>
      </div>
      {empty ? (
        <div className="rounded-md border border-dashed border-zinc-300 bg-white px-4 py-6 text-sm text-zinc-500">
          {emptyHint}
        </div>
      ) : (
        <div className="grid gap-4">{children}</div>
      )}
    </section>
  );
}

function RecordCard({
  title,
  subtitle,
  description,
  footer,
}: {
  title: string;
  subtitle: string;
  description: string;
  footer: string;
}) {
  return (
    <article className="rounded-md border border-zinc-200 bg-white p-5">
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-base font-semibold text-zinc-950">{title}</h3>
          <span className="shrink-0 rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600">
            {subtitle || "记录"}
          </span>
        </div>
        {description ? (
          <p className="text-sm leading-7 text-zinc-600">{description}</p>
        ) : null}
        {footer ? (
          <a
            href={footer}
            target="_blank"
            rel="noreferrer"
            className="break-all text-xs text-emerald-700 hover:text-emerald-800"
          >
            {footer}
          </a>
        ) : null}
      </div>
    </article>
  );
}
