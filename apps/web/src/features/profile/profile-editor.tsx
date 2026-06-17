"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  createHonor,
  createPortfolioLink,
  createProject,
  createWorkExperience,
  deleteHonor,
  deletePortfolioLink,
  deleteProject,
  deleteWorkExperience,
  getProfileWorkspace,
  saveBasicProfile,
  saveIntroduction,
  saveSkills,
  uploadAvatar,
  type HonorAward,
  type PortfolioLink,
  type ProfileWorkspace,
  type ProjectExperience,
  type WorkExperience,
} from "@/lib/profile-api";

const basicDefault = {
  realName: "",
  email: "",
  avatarUrl: "",
  headline: "",
  location: "",
  visible: true,
};

const projectDefault = {
  projectName: "",
  periodText: "",
  projectSummary: "",
  roleDescription: "",
  personalContribution: "",
  repositoryUrl: "",
};

const honorDefault = {
  awardName: "",
  awardedDate: "",
  awardLevel: "",
  certificatePdfUrl: "",
};

const workDefault = {
  organization: "",
  positionTitle: "",
  periodText: "",
  workContent: "",
  achievements: "",
};

const linkDefault = {
  linkName: "",
  linkUrl: "",
};

export function ProfileEditor() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [hasProfile, setHasProfile] = useState(false);

  const [basic, setBasic] = useState(basicDefault);
  const [introduction, setIntroduction] = useState("");
  const [skillsText, setSkillsText] = useState("");
  const [projectForm, setProjectForm] = useState(projectDefault);
  const [honorForm, setHonorForm] = useState(honorDefault);
  const [workForm, setWorkForm] = useState(workDefault);
  const [linkForm, setLinkForm] = useState(linkDefault);

  const [projects, setProjects] = useState<ProjectExperience[]>([]);
  const [honors, setHonors] = useState<HonorAward[]>([]);
  const [works, setWorks] = useState<WorkExperience[]>([]);
  const [links, setLinks] = useState<PortfolioLink[]>([]);

  function applyWorkspace(workspace: ProfileWorkspace) {
    setHasProfile(Boolean(workspace.profile));
    setBasic(
      workspace.profile
        ? {
            realName: workspace.profile.realName,
            email: workspace.profile.email ?? "",
            avatarUrl: workspace.profile.avatarUrl ?? "",
            headline: workspace.profile.headline ?? "",
            location: workspace.profile.location ?? "",
            visible: workspace.profile.visible,
          }
        : basicDefault,
    );
    setIntroduction(workspace.introduction ?? "");
    setSkillsText(workspace.skillsText ?? "");
    setProjects(workspace.projects ?? []);
    setHonors(workspace.honors ?? []);
    setWorks(workspace.workExperiences ?? []);
    setLinks(workspace.links ?? []);
  }

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      const workspace = await getProfileWorkspace();
      applyWorkspace(workspace);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "无法加载个人资料");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;

    getProfileWorkspace()
      .then((workspace) => {
        if (active) {
          applyWorkspace(workspace);
        }
      })
      .catch((cause) => {
        if (active) {
          setError(cause instanceof Error ? cause.message : "无法加载个人资料");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  async function run(action: string, task: () => Promise<void>) {
    setSaving(action);
    setError("");
    setMessage("");
    try {
      await task();
      setMessage("已保存");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "保存失败");
    } finally {
      setSaving("");
    }
  }

  const profileRequiredTip = hasProfile
    ? null
    : "请先保存基础资料，再编辑简介、技能和经历。";

  if (loading) {
    return <p className="text-sm text-zinc-500">正在加载个人资料...</p>;
  }

  return (
    <div className="grid gap-6">
      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {message}
        </p>
      ) : null}

      <section className="rounded-md border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-950">基础资料</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <TextField label="姓名" value={basic.realName} onChange={(realName) => setBasic({ ...basic, realName })} />
          <TextField label="邮箱" value={basic.email} onChange={(email) => setBasic({ ...basic, email })} />
          <AvatarField
            value={basic.avatarUrl}
            disabled={!hasProfile || saving === "avatar"}
            onUpload={(file) =>
              run("avatar", async () => {
                const response = await uploadAvatar(file);
                setBasic({ ...basic, avatarUrl: response.avatarUrl });
                await refresh();
              })
            }
          />
          <TextField label="身份标题" value={basic.headline} onChange={(headline) => setBasic({ ...basic, headline })} />
          <TextField label="所在地" value={basic.location} onChange={(location) => setBasic({ ...basic, location })} />
          <label className="flex items-center gap-2 text-sm font-medium text-zinc-700">
            <input
              type="checkbox"
              checked={basic.visible}
              onChange={(event) => setBasic({ ...basic, visible: event.target.checked })}
              className="size-4 rounded border-zinc-300"
            />
            公开展示
          </label>
        </div>
        <Button
          className="mt-5 h-10"
          disabled={saving === "basic"}
          onClick={() =>
            run("basic", async () => {
              if (!basic.realName.trim() || !basic.email.trim()) {
                throw new Error("请填写姓名和邮箱，其它内容可以暂时留空。");
              }
              await saveBasicProfile({
                ...basic,
                realName: basic.realName.trim(),
                email: basic.email.trim(),
                avatarUrl: basic.avatarUrl || undefined,
                headline: basic.headline || undefined,
                location: basic.location || undefined,
              });
              await refresh();
            })
          }
        >
          {saving === "basic" ? "保存中..." : "保存基础资料"}
        </Button>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <TextAreaCard
          title="个人介绍"
          value={introduction}
          disabled={!hasProfile}
          tip={profileRequiredTip}
          onChange={setIntroduction}
          onSave={() => run("intro", () => saveIntroduction(introduction))}
          saving={saving === "intro"}
        />
        <TextAreaCard
          title="专业技能"
          value={skillsText}
          disabled={!hasProfile}
          tip={profileRequiredTip}
          onChange={setSkillsText}
          onSave={() => run("skills", () => saveSkills(skillsText))}
          saving={saving === "skills"}
        />
      </section>

      <CollectionCard
        title="项目经历"
        disabled={!hasProfile}
        tip={profileRequiredTip}
        form={
          <div className="grid gap-4 md:grid-cols-2">
            <TextField label="项目名称" value={projectForm.projectName} onChange={(projectName) => setProjectForm({ ...projectForm, projectName })} />
            <TextField label="时间" value={projectForm.periodText} onChange={(periodText) => setProjectForm({ ...projectForm, periodText })} />
            <TextAreaField label="项目简介" value={projectForm.projectSummary} onChange={(projectSummary) => setProjectForm({ ...projectForm, projectSummary })} />
            <TextAreaField label="个人职责" value={projectForm.roleDescription} onChange={(roleDescription) => setProjectForm({ ...projectForm, roleDescription })} />
            <TextAreaField label="个人贡献" value={projectForm.personalContribution} onChange={(personalContribution) => setProjectForm({ ...projectForm, personalContribution })} />
            <TextField label="仓库链接" value={projectForm.repositoryUrl} onChange={(repositoryUrl) => setProjectForm({ ...projectForm, repositoryUrl })} />
          </div>
        }
        onAdd={() =>
          run("project", async () => {
            await createProject({
              projectName: projectForm.projectName,
              periodText: projectForm.periodText || undefined,
              projectSummary: projectForm.projectSummary || undefined,
              roleDescription: projectForm.roleDescription || undefined,
              personalContribution: projectForm.personalContribution || undefined,
              repositoryUrl: projectForm.repositoryUrl || undefined,
            });
            setProjectForm(projectDefault);
            await refresh();
          })
        }
        saving={saving === "project"}
      >
        {projects.map((project) => (
          <ListItem
            key={project.id}
            title={project.projectName}
            detail={project.periodText ?? project.repositoryUrl ?? "项目经历"}
            onDelete={() => run("deleteProject", async () => {
              await deleteProject(project.id);
              await refresh();
            })}
          />
        ))}
      </CollectionCard>

      <CollectionCard
        title="荣誉奖项"
        disabled={!hasProfile}
        tip={profileRequiredTip}
        form={
          <div className="grid gap-4 md:grid-cols-2">
            <TextField label="奖项名称" value={honorForm.awardName} onChange={(awardName) => setHonorForm({ ...honorForm, awardName })} />
            <TextField label="获奖时间" value={honorForm.awardedDate} onChange={(awardedDate) => setHonorForm({ ...honorForm, awardedDate })} placeholder="YYYY-MM-DD" />
            <TextField label="奖项级别" value={honorForm.awardLevel} onChange={(awardLevel) => setHonorForm({ ...honorForm, awardLevel })} />
            <TextField label="证书 PDF URL" value={honorForm.certificatePdfUrl} onChange={(certificatePdfUrl) => setHonorForm({ ...honorForm, certificatePdfUrl })} />
          </div>
        }
        onAdd={() =>
          run("honor", async () => {
            await createHonor({
              awardName: honorForm.awardName,
              awardedDate: honorForm.awardedDate || undefined,
              awardLevel: honorForm.awardLevel || undefined,
              certificatePdfUrl: honorForm.certificatePdfUrl || undefined,
            });
            setHonorForm(honorDefault);
            await refresh();
          })
        }
        saving={saving === "honor"}
      >
        {honors.map((honor) => (
          <ListItem
            key={honor.id}
            title={honor.awardName}
            detail={honor.awardLevel ?? honor.awardedDate ?? "荣誉奖项"}
            onDelete={() => run("deleteHonor", async () => {
              await deleteHonor(honor.id);
              await refresh();
            })}
          />
        ))}
      </CollectionCard>

      <CollectionCard
        title="工作/实习经历"
        disabled={!hasProfile}
        tip={profileRequiredTip}
        form={
          <div className="grid gap-4 md:grid-cols-2">
            <TextField label="公司/组织" value={workForm.organization} onChange={(organization) => setWorkForm({ ...workForm, organization })} />
            <TextField label="职位" value={workForm.positionTitle} onChange={(positionTitle) => setWorkForm({ ...workForm, positionTitle })} />
            <TextField label="时间" value={workForm.periodText} onChange={(periodText) => setWorkForm({ ...workForm, periodText })} />
            <TextAreaField label="工作内容" value={workForm.workContent} onChange={(workContent) => setWorkForm({ ...workForm, workContent })} />
            <TextAreaField label="主要成果" value={workForm.achievements} onChange={(achievements) => setWorkForm({ ...workForm, achievements })} />
          </div>
        }
        onAdd={() =>
          run("work", async () => {
            await createWorkExperience({
              organization: workForm.organization,
              positionTitle: workForm.positionTitle || undefined,
              periodText: workForm.periodText || undefined,
              workContent: workForm.workContent || undefined,
              achievements: workForm.achievements || undefined,
            });
            setWorkForm(workDefault);
            await refresh();
          })
        }
        saving={saving === "work"}
      >
        {works.map((work) => (
          <ListItem
            key={work.id}
            title={work.organization}
            detail={[work.positionTitle, work.periodText].filter(Boolean).join(" / ") || "工作经历"}
            onDelete={() => run("deleteWork", async () => {
              await deleteWorkExperience(work.id);
              await refresh();
            })}
          />
        ))}
      </CollectionCard>

      <CollectionCard
        title="作品链接"
        disabled={!hasProfile}
        tip={profileRequiredTip}
        form={
          <div className="grid gap-4 md:grid-cols-2">
            <TextField label="链接名称" value={linkForm.linkName} onChange={(linkName) => setLinkForm({ ...linkForm, linkName })} />
            <TextField label="链接地址" value={linkForm.linkUrl} onChange={(linkUrl) => setLinkForm({ ...linkForm, linkUrl })} />
          </div>
        }
        onAdd={() =>
          run("link", async () => {
            await createPortfolioLink(linkForm);
            setLinkForm(linkDefault);
            await refresh();
          })
        }
        saving={saving === "link"}
      >
        {links.map((link) => (
          <ListItem
            key={link.id}
            title={link.linkName}
            detail={link.linkUrl}
            onDelete={() => run("deleteLink", async () => {
              await deletePortfolioLink(link.id);
              await refresh();
            })}
          />
        ))}
      </CollectionCard>
    </div>
  );
}

function AvatarField({
  value,
  disabled,
  onUpload,
}: {
  value: string;
  disabled: boolean;
  onUpload: (file: File) => void;
}) {
  return (
    <div className="grid gap-2 text-sm font-medium text-zinc-700">
      一寸照
      <div className="flex items-center gap-4 rounded-md border border-zinc-300 p-3">
        {value ? (
          <Image
            src={value}
            alt="一寸照预览"
            width={80}
            height={96}
            unoptimized
            className="h-24 w-20 rounded-sm border border-zinc-200 object-cover"
          />
        ) : (
          <div className="grid h-24 w-20 place-items-center rounded-sm border border-dashed border-zinc-300 text-xs text-zinc-400">
            未上传
          </div>
        )}
        <div className="grid gap-2">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={disabled}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                onUpload(file);
                event.target.value = "";
              }
            }}
            className="text-sm text-zinc-600 file:mr-3 file:h-9 file:rounded-md file:border-0 file:bg-zinc-950 file:px-3 file:text-sm file:font-medium file:text-white disabled:opacity-50"
          />
          <p className="text-xs font-normal text-zinc-500">
            请先保存姓名和邮箱，再上传 JPG、PNG 或 WebP 图片。
          </p>
        </div>
      </div>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-zinc-700">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 rounded-md border border-zinc-300 px-3 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950"
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-zinc-700">
      {label}
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-28 rounded-md border border-zinc-300 px-3 py-2 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950"
      />
    </label>
  );
}

function TextAreaCard({
  title,
  value,
  disabled,
  tip,
  saving,
  onChange,
  onSave,
}: {
  title: string;
  value: string;
  disabled: boolean;
  tip: string | null;
  saving: boolean;
  onChange: (value: string) => void;
  onSave: () => void;
}) {
  return (
    <section className="rounded-md border border-zinc-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-zinc-950">{title}</h2>
      {tip ? <p className="mt-2 text-sm text-amber-700">{tip}</p> : null}
      <textarea
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="mt-5 min-h-40 w-full rounded-md border border-zinc-300 px-3 py-2 outline-none transition disabled:bg-zinc-100 focus:border-zinc-950"
      />
      <Button className="mt-4 h-10" disabled={disabled || saving} onClick={onSave}>
        {saving ? "保存中..." : "保存"}
      </Button>
    </section>
  );
}

function CollectionCard({
  title,
  disabled,
  tip,
  form,
  saving,
  onAdd,
  children,
}: {
  title: string;
  disabled: boolean;
  tip: string | null;
  form: ReactNode;
  saving: boolean;
  onAdd: () => void;
  children: ReactNode;
}) {
  return (
    <section className="rounded-md border border-zinc-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-zinc-950">{title}</h2>
      {tip ? <p className="mt-2 text-sm text-amber-700">{tip}</p> : null}
      <div className={disabled ? "pointer-events-none mt-5 opacity-50" : "mt-5"}>{form}</div>
      <Button className="mt-4 h-10" disabled={disabled || saving} onClick={onAdd}>
        {saving ? "添加中..." : "添加"}
      </Button>
      <div className="mt-5 grid gap-3">{children}</div>
    </section>
  );
}

function ListItem({
  title,
  detail,
  onDelete,
}: {
  title: string;
  detail: string;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-zinc-200 px-4 py-3">
      <div>
        <p className="text-sm font-medium text-zinc-950">{title}</p>
        <p className="mt-1 break-all text-xs text-zinc-500">{detail}</p>
      </div>
      <Button type="button" variant="outline" onClick={onDelete}>
        删除
      </Button>
    </div>
  );
}
