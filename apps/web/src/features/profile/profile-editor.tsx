"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  createHonor,
  createPortfolioLink,
  createProject,
  createProjectLink,
  createSkillItem,
  createWorkExperience,
  deleteHonor,
  deletePortfolioLink,
  deleteProject,
  deleteProjectLink,
  deleteSkillItem,
  deleteWorkExperience,
  getProfileWorkspace,
  saveBasicProfile,
  saveIntroduction,
  updateHonor,
  updateProject,
  updateSkillItem,
  uploadAvatar,
  type HonorAward,
  type PortfolioLink,
  type ProfileWorkspace,
  type ProjectExperience,
  type SkillItem,
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

const skillDefault = {
  skillName: "",
  skillDescription: "",
  sortOrder: "0",
  visible: true,
};

const projectDefault = {
  projectName: "",
  periodText: "",
  projectSummary: "",
  roleDescription: "",
  personalContribution: "",
  sortOrder: "0",
  visible: true,
};

const projectLinkDefault = {
  linkName: "",
  linkUrl: "",
  sortOrder: "0",
  visible: true,
};

const honorDefault = {
  awardName: "",
  awardedDate: "",
  awardLevel: "",
  certificatePdfUrl: "",
  sortOrder: "0",
  visible: true,
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

type EditingState = {
  type: "skill" | "project" | "honor";
  id: number;
} | null;

export function ProfileEditor() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [hasProfile, setHasProfile] = useState(false);
  const [editing, setEditing] = useState<EditingState>(null);

  const [basic, setBasic] = useState(basicDefault);
  const [introduction, setIntroduction] = useState("");
  const [skillForm, setSkillForm] = useState(skillDefault);
  const [projectForm, setProjectForm] = useState(projectDefault);
  const [projectLinkForms, setProjectLinkForms] = useState<
    Record<number, typeof projectLinkDefault>
  >({});
  const [honorForm, setHonorForm] = useState(honorDefault);
  const [workForm, setWorkForm] = useState(workDefault);
  const [linkForm, setLinkForm] = useState(linkDefault);

  const [skillItems, setSkillItems] = useState<SkillItem[]>([]);
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
    setSkillItems(workspace.skillItems ?? []);
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

  function updateProjectLinkForm(
    projectId: number,
    nextValue: Partial<typeof projectLinkDefault>,
  ) {
    setProjectLinkForms((current) => ({
      ...current,
      [projectId]: {
        ...(current[projectId] ?? projectLinkDefault),
        ...nextValue,
      },
    }));
  }

  const profileRequiredTip = hasProfile
    ? null
    : "请先保存基础资料，再编辑简介、技能和经历。";

  const editingSkillId = editing?.type === "skill" ? editing.id : null;
  const editingProjectId = editing?.type === "project" ? editing.id : null;
  const editingHonorId = editing?.type === "honor" ? editing.id : null;

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
          <TextField
            label="姓名"
            value={basic.realName}
            onChange={(realName) => setBasic({ ...basic, realName })}
          />
          <TextField
            label="邮箱"
            value={basic.email}
            onChange={(email) => setBasic({ ...basic, email })}
          />
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
          <TextField
            label="身份标题"
            value={basic.headline}
            onChange={(headline) => setBasic({ ...basic, headline })}
          />
          <TextField
            label="所在地"
            value={basic.location}
            onChange={(location) => setBasic({ ...basic, location })}
          />
          <CheckboxField
            label="公开展示"
            checked={basic.visible}
            onChange={(visible) => setBasic({ ...basic, visible })}
          />
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

      <TextAreaCard
        title="个人介绍"
        value={introduction}
        disabled={!hasProfile}
        tip={profileRequiredTip}
        onChange={setIntroduction}
        onSave={() => run("intro", () => saveIntroduction(introduction))}
        saving={saving === "intro"}
      />

      <CollectionCard
        title={editingSkillId ? "编辑专业技能" : "专业技能"}
        description="按模块维护技能，比如前后端技能、机器学习技能、工程工具等。"
        disabled={!hasProfile}
        tip={profileRequiredTip}
        form={
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_160px_120px]">
            <TextField
              label="技能名称"
              value={skillForm.skillName}
              onChange={(skillName) => setSkillForm({ ...skillForm, skillName })}
            />
            <TextField
              label="排序"
              type="number"
              value={skillForm.sortOrder}
              onChange={(sortOrder) => setSkillForm({ ...skillForm, sortOrder })}
            />
            <CheckboxField
              label="公开展示"
              checked={skillForm.visible}
              onChange={(visible) => setSkillForm({ ...skillForm, visible })}
            />
            <div className="md:col-span-3">
              <TextAreaField
                label="技能介绍"
                value={skillForm.skillDescription}
                onChange={(skillDescription) =>
                  setSkillForm({ ...skillForm, skillDescription })
                }
              />
            </div>
          </div>
        }
        onAdd={() =>
          run("skill", async () => {
            if (!skillForm.skillName.trim()) {
              throw new Error("请填写技能名称。");
            }
            const request = {
              skillName: skillForm.skillName.trim(),
              skillDescription: skillForm.skillDescription || undefined,
              sortOrder: parseSortOrder(skillForm.sortOrder),
              visible: skillForm.visible,
            };
            if (editingSkillId) {
              await updateSkillItem(editingSkillId, request);
            } else {
              await createSkillItem(request);
            }
            setSkillForm(skillDefault);
            setEditing(null);
            await refresh();
          })
        }
        saving={saving === "skill"}
        actionLabel={editingSkillId ? "保存修改" : "添加"}
        secondaryAction={
          editingSkillId
            ? {
                label: "取消编辑",
                onClick: () => {
                  setSkillForm(skillDefault);
                  setEditing(null);
                },
              }
            : undefined
        }
      >
        {skillItems.map((skill) => (
          <ListItem
            key={skill.id}
            title={skill.skillName}
            detail={skill.skillDescription || `排序 ${skill.sortOrder}`}
            meta={skill.visible ? "公开" : "隐藏"}
            onEdit={() => {
              setEditing({ type: "skill", id: skill.id });
              setSkillForm({
                skillName: skill.skillName,
                skillDescription: skill.skillDescription ?? "",
                sortOrder: String(skill.sortOrder),
                visible: skill.visible,
              });
            }}
            onDelete={() =>
              run("deleteSkill", async () => {
                await deleteSkillItem(skill.id);
                if (editingSkillId === skill.id) {
                  setSkillForm(skillDefault);
                  setEditing(null);
                }
                await refresh();
              })
            }
          />
        ))}
      </CollectionCard>

      <CollectionCard
        title={editingProjectId ? "编辑项目经历" : "项目经历"}
        description="先创建项目经历，再在项目下维护一个或多个项目链接。"
        disabled={!hasProfile}
        tip={profileRequiredTip}
        form={
          <div className="grid gap-4">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_120px_140px]">
              <TextField
                label="项目名称"
                value={projectForm.projectName}
                onChange={(projectName) =>
                  setProjectForm({ ...projectForm, projectName })
                }
              />
              <TextField
                label="时间"
                value={projectForm.periodText}
                onChange={(periodText) =>
                  setProjectForm({ ...projectForm, periodText })
                }
              />
              <TextField
                label="排序"
                type="number"
                value={projectForm.sortOrder}
                onChange={(sortOrder) =>
                  setProjectForm({ ...projectForm, sortOrder })
                }
              />
              <CheckboxField
                label="公开展示"
                checked={projectForm.visible}
                onChange={(visible) => setProjectForm({ ...projectForm, visible })}
              />
            </div>
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.8fr)_minmax(0,1fr)]">
              <TextAreaField
                label="项目简介"
                value={projectForm.projectSummary}
                onChange={(projectSummary) =>
                  setProjectForm({ ...projectForm, projectSummary })
                }
              />
              <TextAreaField
                label="个人职责"
                value={projectForm.roleDescription}
                onChange={(roleDescription) =>
                  setProjectForm({ ...projectForm, roleDescription })
                }
              />
              <TextAreaField
                label="个人贡献"
                value={projectForm.personalContribution}
                onChange={(personalContribution) =>
                  setProjectForm({ ...projectForm, personalContribution })
                }
              />
            </div>
          </div>
        }
        onAdd={() =>
          run("project", async () => {
            if (!projectForm.projectName.trim()) {
              throw new Error("请填写项目名称。");
            }
            const request = {
              projectName: projectForm.projectName.trim(),
              periodText: projectForm.periodText || undefined,
              projectSummary: projectForm.projectSummary || undefined,
              roleDescription: projectForm.roleDescription || undefined,
              personalContribution: projectForm.personalContribution || undefined,
              sortOrder: parseSortOrder(projectForm.sortOrder),
              visible: projectForm.visible,
            };
            if (editingProjectId) {
              await updateProject(editingProjectId, request);
            } else {
              await createProject(request);
            }
            setProjectForm(projectDefault);
            setEditing(null);
            await refresh();
          })
        }
        saving={saving === "project"}
        actionLabel={editingProjectId ? "保存修改" : "添加"}
        secondaryAction={
          editingProjectId
            ? {
                label: "取消编辑",
                onClick: () => {
                  setProjectForm(projectDefault);
                  setEditing(null);
                },
              }
            : undefined
        }
      >
        {projects.map((project) => {
          const linkFormForProject =
            projectLinkForms[project.id] ?? projectLinkDefault;
          const linkSavingKey = `projectLink:${project.id}`;

          return (
            <ProjectWorkspaceItem
              key={project.id}
              project={project}
              linkForm={linkFormForProject}
              saving={saving}
              linkSavingKey={linkSavingKey}
              onEditProject={() => {
                setEditing({ type: "project", id: project.id });
                setProjectForm({
                  projectName: project.projectName,
                  periodText: project.periodText ?? "",
                  projectSummary: project.projectSummary ?? "",
                  roleDescription: project.roleDescription ?? "",
                  personalContribution: project.personalContribution ?? "",
                  sortOrder: String(project.sortOrder),
                  visible: project.visible,
                });
              }}
              onDeleteProject={() =>
                run("deleteProject", async () => {
                  await deleteProject(project.id);
                  if (editingProjectId === project.id) {
                    setProjectForm(projectDefault);
                    setEditing(null);
                  }
                  await refresh();
                })
              }
              onChangeLinkForm={(nextValue) =>
                updateProjectLinkForm(project.id, nextValue)
              }
              onAddLink={() =>
                run(linkSavingKey, async () => {
                  if (!linkFormForProject.linkName.trim()) {
                    throw new Error("请填写链接名称。");
                  }
                  if (!linkFormForProject.linkUrl.trim()) {
                    throw new Error("请填写链接地址。");
                  }
                  await createProjectLink(project.id, {
                    linkName: linkFormForProject.linkName.trim(),
                    linkUrl: linkFormForProject.linkUrl.trim(),
                    sortOrder: parseSortOrder(linkFormForProject.sortOrder),
                    visible: linkFormForProject.visible,
                  });
                  setProjectLinkForms((current) => ({
                    ...current,
                    [project.id]: projectLinkDefault,
                  }));
                  await refresh();
                })
              }
              onDeleteLink={(linkId) =>
                run("deleteProjectLink", async () => {
                  await deleteProjectLink(project.id, linkId);
                  await refresh();
                })
              }
            />
          );
        })}
      </CollectionCard>

      <CollectionCard
        title={editingHonorId ? "编辑荣誉奖项" : "荣誉奖项"}
        disabled={!hasProfile}
        tip={profileRequiredTip}
        form={
          <div className="grid gap-4">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
              <TextField
                label="奖项名称"
                value={honorForm.awardName}
                onChange={(awardName) =>
                  setHonorForm({ ...honorForm, awardName })
                }
              />
              <TextField
                label="获奖时间"
                value={honorForm.awardedDate}
                onChange={(awardedDate) =>
                  setHonorForm({ ...honorForm, awardedDate })
                }
                placeholder="YYYY-MM-DD"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_140px_140px] lg:max-w-3xl">
              <TextField
                label="奖项级别"
                value={honorForm.awardLevel}
                onChange={(awardLevel) =>
                  setHonorForm({ ...honorForm, awardLevel })
                }
              />
              <TextField
                label="排序"
                type="number"
                value={honorForm.sortOrder}
                onChange={(sortOrder) =>
                  setHonorForm({ ...honorForm, sortOrder })
                }
              />
              <CheckboxField
                label="公开展示"
                checked={honorForm.visible}
                onChange={(visible) => setHonorForm({ ...honorForm, visible })}
              />
            </div>
            <TextField
              label="证书 PDF URL"
              value={honorForm.certificatePdfUrl}
              onChange={(certificatePdfUrl) =>
                setHonorForm({ ...honorForm, certificatePdfUrl })
              }
            />
          </div>
        }
        onAdd={() =>
          run("honor", async () => {
            if (!honorForm.awardName.trim()) {
              throw new Error("请填写奖项名称。");
            }
            const request = {
              awardName: honorForm.awardName,
              awardedDate: honorForm.awardedDate || undefined,
              awardLevel: honorForm.awardLevel || undefined,
              certificatePdfUrl: honorForm.certificatePdfUrl || undefined,
              sortOrder: parseSortOrder(honorForm.sortOrder),
              visible: honorForm.visible,
            };
            if (editingHonorId) {
              await updateHonor(editingHonorId, request);
            } else {
              await createHonor(request);
            }
            setHonorForm(honorDefault);
            setEditing(null);
            await refresh();
          })
        }
        saving={saving === "honor"}
        actionLabel={editingHonorId ? "保存修改" : "添加"}
        secondaryAction={
          editingHonorId
            ? {
                label: "取消编辑",
                onClick: () => {
                  setHonorForm(honorDefault);
                  setEditing(null);
                },
              }
            : undefined
        }
      >
        {honors.map((honor) => (
          <ListItem
            key={honor.id}
            title={honor.awardName}
            detail={honor.awardLevel ?? honor.awardedDate ?? "荣誉奖项"}
            onEdit={() => {
              setEditing({ type: "honor", id: honor.id });
              setHonorForm({
                awardName: honor.awardName,
                awardedDate: honor.awardedDate ?? "",
                awardLevel: honor.awardLevel ?? "",
                certificatePdfUrl: honor.certificatePdfUrl ?? "",
                sortOrder: String(honor.sortOrder),
                visible: honor.visible,
              });
            }}
            onDelete={() =>
              run("deleteHonor", async () => {
                await deleteHonor(honor.id);
                if (editingHonorId === honor.id) {
                  setHonorForm(honorDefault);
                  setEditing(null);
                }
                await refresh();
              })
            }
          />
        ))}
      </CollectionCard>

      <CollectionCard
        title="工作/实习经历"
        disabled={!hasProfile}
        tip={profileRequiredTip}
        form={
          <div className="grid gap-4 md:grid-cols-2">
            <TextField
              label="公司/组织"
              value={workForm.organization}
              onChange={(organization) =>
                setWorkForm({ ...workForm, organization })
              }
            />
            <TextField
              label="职位"
              value={workForm.positionTitle}
              onChange={(positionTitle) =>
                setWorkForm({ ...workForm, positionTitle })
              }
            />
            <TextField
              label="时间"
              value={workForm.periodText}
              onChange={(periodText) => setWorkForm({ ...workForm, periodText })}
            />
            <TextAreaField
              label="工作内容"
              value={workForm.workContent}
              onChange={(workContent) =>
                setWorkForm({ ...workForm, workContent })
              }
            />
            <TextAreaField
              label="主要成果"
              value={workForm.achievements}
              onChange={(achievements) =>
                setWorkForm({ ...workForm, achievements })
              }
            />
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
            detail={
              [work.positionTitle, work.periodText].filter(Boolean).join(" / ") ||
              "工作经历"
            }
            onDelete={() =>
              run("deleteWork", async () => {
                await deleteWorkExperience(work.id);
                await refresh();
              })
            }
          />
        ))}
      </CollectionCard>

      <CollectionCard
        title="作品链接"
        disabled={!hasProfile}
        tip={profileRequiredTip}
        form={
          <div className="grid gap-4 md:grid-cols-2">
            <TextField
              label="链接名称"
              value={linkForm.linkName}
              onChange={(linkName) => setLinkForm({ ...linkForm, linkName })}
            />
            <TextField
              label="链接地址"
              value={linkForm.linkUrl}
              onChange={(linkUrl) => setLinkForm({ ...linkForm, linkUrl })}
            />
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
            onDelete={() =>
              run("deleteLink", async () => {
                await deletePortfolioLink(link.id);
                await refresh();
              })
            }
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
            src={assetUrl(value)}
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
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="grid min-w-0 gap-2 text-sm font-medium text-zinc-700">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 w-full min-w-0 rounded-md border border-zinc-300 px-3 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950"
      />
    </label>
  );
}

function CheckboxField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex h-11 items-center gap-2 self-end text-sm font-medium text-zinc-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-4 rounded border-zinc-300"
      />
      {label}
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
    <label className="grid min-w-0 gap-2 text-sm font-medium text-zinc-700">
      {label}
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-28 w-full min-w-0 rounded-md border border-zinc-300 px-3 py-2 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950"
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
  description,
  disabled,
  tip,
  form,
  saving,
  actionLabel = "添加",
  secondaryAction,
  onAdd,
  children,
}: {
  title: string;
  description?: string;
  disabled: boolean;
  tip: string | null;
  form: ReactNode;
  saving: boolean;
  actionLabel?: string;
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  onAdd: () => void;
  children: ReactNode;
}) {
  return (
    <section className="rounded-md border border-zinc-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-zinc-950">{title}</h2>
        {description ? (
          <p className="mt-2 text-sm leading-6 text-zinc-500">{description}</p>
        ) : null}
      </div>
      {tip ? <p className="mt-2 text-sm text-amber-700">{tip}</p> : null}
      <div className={disabled ? "pointer-events-none mt-5 opacity-50" : "mt-5"}>
        {form}
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button className="h-10" disabled={disabled || saving} onClick={onAdd}>
          {saving ? "处理中..." : actionLabel}
        </Button>
        {secondaryAction ? (
          <Button
            type="button"
            variant="outline"
            className="h-10"
            disabled={disabled || saving}
            onClick={secondaryAction.onClick}
          >
            {secondaryAction.label}
          </Button>
        ) : null}
      </div>
      <div className="mt-5 grid gap-3">{children}</div>
    </section>
  );
}

function ProjectWorkspaceItem({
  project,
  linkForm,
  saving,
  linkSavingKey,
  onEditProject,
  onDeleteProject,
  onChangeLinkForm,
  onAddLink,
  onDeleteLink,
}: {
  project: ProjectExperience;
  linkForm: typeof projectLinkDefault;
  saving: string;
  linkSavingKey: string;
  onEditProject: () => void;
  onDeleteProject: () => void;
  onChangeLinkForm: (value: Partial<typeof projectLinkDefault>) => void;
  onAddLink: () => void;
  onDeleteLink: (linkId: number) => void;
}) {
  const projectLinks = project.projectLinks ?? [];

  return (
    <div className="rounded-md border border-zinc-200 px-4 py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-zinc-950">
              {project.projectName}
            </p>
            <span className="rounded-sm bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500">
              排序 {project.sortOrder}
            </span>
            <span className="rounded-sm bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500">
              {project.visible ? "公开" : "隐藏"}
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            {project.periodText ?? "未填写时间"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={onEditProject}>
            编辑项目
          </Button>
          <Button type="button" variant="outline" onClick={onDeleteProject}>
            删除项目
          </Button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 text-xs leading-6 text-zinc-600 lg:grid-cols-3">
        <BriefText label="项目简介" value={project.projectSummary} />
        <BriefText label="个人职责" value={project.roleDescription} />
        <BriefText label="个人贡献" value={project.personalContribution} />
      </div>

      <div className="mt-5 rounded-md bg-zinc-50 p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-zinc-950">项目链接</h3>
          <span className="text-xs text-zinc-500">{projectLinks.length} 个链接</span>
        </div>

        <div className="mt-3 grid gap-2">
          {projectLinks.length ? (
            projectLinks.map((link) => (
              <div
                key={link.id}
                className="flex flex-col gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-zinc-900">
                    {link.linkName}
                  </p>
                  <p className="mt-0.5 break-all text-xs text-zinc-500">
                    {link.linkUrl}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onDeleteLink(link.id)}
                >
                  删除链接
                </Button>
              </div>
            ))
          ) : (
            <p className="rounded-md border border-dashed border-zinc-200 bg-white px-3 py-3 text-xs text-zinc-500">
              暂无项目链接
            </p>
          )}
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)_100px_110px_auto]">
          <TextField
            label="链接名称"
            value={linkForm.linkName}
            onChange={(linkName) => onChangeLinkForm({ linkName })}
          />
          <TextField
            label="链接地址"
            value={linkForm.linkUrl}
            onChange={(linkUrl) => onChangeLinkForm({ linkUrl })}
          />
          <TextField
            label="排序"
            type="number"
            value={linkForm.sortOrder}
            onChange={(sortOrder) => onChangeLinkForm({ sortOrder })}
          />
          <CheckboxField
            label="公开"
            checked={linkForm.visible}
            onChange={(visible) => onChangeLinkForm({ visible })}
          />
          <Button
            className="h-11 self-end"
            disabled={saving === linkSavingKey}
            onClick={onAddLink}
          >
            {saving === linkSavingKey ? "添加中..." : "添加链接"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function BriefText({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div>
      <p className="font-medium text-zinc-900">{label}</p>
      <p className="mt-1 line-clamp-3 whitespace-pre-wrap">
        {value?.trim() || "未填写"}
      </p>
    </div>
  );
}

function ListItem({
  title,
  detail,
  meta,
  onEdit,
  onDelete,
}: {
  title: string;
  detail: string;
  meta?: string;
  onEdit?: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-zinc-200 px-4 py-3">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium text-zinc-950">{title}</p>
          {meta ? (
            <span className="rounded-sm bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500">
              {meta}
            </span>
          ) : null}
        </div>
        <p className="mt-1 break-all text-xs text-zinc-500">{detail}</p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        {onEdit ? (
          <Button type="button" variant="outline" onClick={onEdit}>
            编辑
          </Button>
        ) : null}
        <Button type="button" variant="outline" onClick={onDelete}>
          删除
        </Button>
      </div>
    </div>
  );
}

function parseSortOrder(value: string) {
  const nextValue = Number(value);
  return Number.isFinite(nextValue) ? nextValue : undefined;
}

function assetUrl(value: string) {
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  const path = value.startsWith("/") ? value : `/${value}`;
  return `${baseUrl}${path}`;
}
