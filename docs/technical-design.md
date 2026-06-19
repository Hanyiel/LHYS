# LHYS 技术设计文档

## 1. 项目目标

LHYS 是一个个人信息展示与管理员工作台项目，目标是：

- 对外展示个人简介、一寸照、邮箱、项目经历、专业技能、荣誉奖项和作品链接。
- 管理员登录后可以维护自己的公开资料。
- 后续可继续扩展桌面端或移动端客户端，共用同一套后端 API。
- 支持从本地开发迁移到服务器部署。

## 2. 需求分析

### 2.1 公开访问端

公开首页面向访客，主要展示：

- 基础信息：姓名、邮箱、所在地、身份标题、一寸照。
- 个人介绍：一段较完整的个人简介。
- 专业技能：按模块拆分，例如前后端技能、机器学习技能、工程工具。
- 项目经历：项目名称、时间、项目简介、个人职责、个人贡献、项目链接。
- 荣誉奖项：奖项名称、获奖时间、奖项级别、证书链接。
- 作品链接：GitHub、个人作品、论文、演示地址等外部链接。

公开端只读取 `visible = true` 的数据。

### 2.2 管理员工作台

管理员登录后可维护：

- 基础资料和一寸照上传。
- 个人介绍。
- 专业技能：新增、修改、删除。
- 项目经历：新增、修改、删除。
- 项目链接：为每个项目新增多个链接、删除链接。
- 荣誉奖项：新增、修改、删除。
- 工作经历与作品链接：目前支持新增、删除，可按同样方式继续扩展修改功能。

### 2.3 权限需求

- 管理员通过账号和密码登录。
- 后端为管理员返回 token。
- 工作台接口需要携带 token。
- 后端根据当前登录管理员查询自己的 `personal_profiles`，避免操作其他管理员的数据。

## 3. 技术栈

### 3.1 前端

- Next.js：React 应用框架，当前用于构建静态导出的前端页面。
- React：组件化 UI 基础。
- TypeScript：为前端数据结构、接口请求和组件 props 提供类型约束。
- Tailwind CSS：页面布局和样式工具类。
- shadcn/ui：基础 UI 组件来源，目前使用 Button、Skeleton 等组件。
- lucide-react：图标库。

### 3.2 后端

- Java 21：后端语言。
- Spring Boot：后端应用框架。
- Spring Web MVC：提供 REST API。
- Spring Security：登录鉴权和接口保护。
- Spring Validation：请求参数校验。
- JdbcTemplate：手写 SQL 访问 MySQL，便于和手动建表方式配合。

### 3.3 数据库

- MySQL：关系型数据库。
- 数据表由开发者在 Navicat 或 1Panel 数据库管理工具中手动创建。
- 后端不负责自动建表，不使用 Flyway 或 JPA 自动 DDL。

## 4. 项目结构

```text
LHYS/
  apps/
    api/                  # Java Spring Boot 后端
      src/main/java/
      src/main/resources/
    web/                  # Next.js 前端
      src/app/            # 页面路由
      src/features/       # 业务功能组件
      src/lib/            # API 封装、工具函数
      src/components/     # 通用组件
  docs/
    database/             # SQL 建表文档
    technical-design.md   # 技术设计文档
    deployment.md         # 部署文档
```

## 5. 数据模型设计

### 5.1 管理员与个人资料

核心关系：

- `admin_users`：管理员账号、密码哈希、角色、启用状态。
- `personal_profiles`：公开个人基础资料，通过 `admin_user_id` 关联管理员。

一个管理员对应一份个人资料。

### 5.2 个人介绍

- `profile_introductions`
- 通过 `profile_id` 关联 `personal_profiles`
- 一个 profile 只保存一条个人介绍。

### 5.3 专业技能

- `profile_skill_items`
- 通过 `profile_id` 关联 `personal_profiles`
- 一个 profile 可以有多条技能项。

典型字段：

- `skill_name`
- `skill_description`
- `sort_order`
- `visible`

### 5.4 项目经历

- `project_experiences`
- 通过 `profile_id` 关联 `personal_profiles`
- 一个 profile 可以有多条项目经历。

典型字段：

- `project_name`
- `period_text`
- `project_summary`
- `role_description`
- `personal_contribution`
- `sort_order`
- `visible`

### 5.5 项目链接

- `project_links`
- 通过 `project_id` 关联 `project_experiences`
- 一个项目可以有多个链接。

典型字段：

- `link_name`
- `link_url`
- `sort_order`
- `visible`

### 5.6 荣誉奖项

- `honor_awards`
- 通过 `profile_id` 关联 `personal_profiles`
- 一个 profile 可以有多条荣誉奖项。

典型字段：

- `award_name`
- `awarded_date`
- `award_level`
- `certificate_pdf_url`
- `sort_order`
- `visible`

## 6. 后端逻辑设计

### 6.1 分层

当前后端主要分为：

- Controller：接收 HTTP 请求，绑定参数，返回响应。
- Service：业务逻辑、权限归属校验、SQL 查询和写入。
- Repository：管理员账号使用 Spring Data JPA Repository。
- DTO：请求和响应 record。

### 6.2 公开资料查询

公开接口：

```text
GET /api/public/profiles/{username}
GET /api/public/profiles/admin-users/{adminUserId}
```

查询逻辑：

1. 找到启用状态的管理员。
2. 找到公开状态的个人资料。
3. 查询个人介绍、技能、项目、荣誉、作品链接。
4. 只返回 `visible = true` 的列表项。

### 6.3 工作台资料查询

工作台接口：

```text
GET /api/admin/profile
```

查询逻辑：

1. 根据 token 解析当前管理员。
2. 根据管理员 ID 找到个人资料。
3. 返回全部工作台可编辑数据，包括隐藏项。

### 6.4 写入和更新

基础资料：

```text
PUT /api/admin/profile/basic
```

个人介绍：

```text
PUT /api/admin/profile/introduction
```

专业技能：

```text
POST /api/admin/profile/skill-items
PUT /api/admin/profile/skill-items/{id}
DELETE /api/admin/profile/skill-items/{id}
```

项目经历：

```text
POST /api/admin/profile/projects
PUT /api/admin/profile/projects/{id}
DELETE /api/admin/profile/projects/{id}
```

项目链接：

```text
POST /api/admin/profile/projects/{projectId}/links
DELETE /api/admin/profile/projects/{projectId}/links/{linkId}
```

荣誉奖项：

```text
POST /api/admin/profile/honors
PUT /api/admin/profile/honors/{id}
DELETE /api/admin/profile/honors/{id}
```

## 7. 前端逻辑设计

### 7.1 页面路由

- `/`：公开个人主页。
- `/login`：管理员登录。
- `/admin`：工作台首页。
- `/admin/profile`：个人资料管理。
- `/admin/users`：管理员管理。
- `/admin/products/servers`：服务器管理。
- `/admin/products/domains`：域名管理。

### 7.2 API 封装

前端 API 统一放在 `apps/web/src/lib/`：

- `api.ts`：统一 fetch 封装。
- `admin-api.ts`：管理员鉴权请求头。
- `profile-api.ts`：个人资料工作台接口。
- `public-profile-api.ts`：公开资料接口。

本地开发通过 `.env.local` 配置：

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

生产环境通常使用同源 `/api` 反向代理，所以可以不配置或配置为空。

### 7.3 工作台编辑体验

`ProfileEditor` 负责个人资料管理：

- 顶部表单用于新增技能、项目、荣誉。
- 点击已有条目的“编辑”后，表单进入编辑模式并回填数据。
- 保存修改后调用后端 PUT 接口。
- 取消编辑后恢复新增模式。
- 项目链接在项目卡片内部维护，一个项目可以拥有多个链接。

### 7.4 一寸照上传与预览

上传流程：

1. 前端使用 `FormData` 上传图片。
2. 后端校验文件类型。
3. 后端生成文件名并保存到上传目录。
4. 后端把 `/uploads/avatars/...` 保存到数据库。
5. 前端展示时把相对地址拼成可访问 URL。

本地开发时图片地址通常为：

```text
http://localhost:8080/uploads/avatars/xxx.jpg
```

生产环境需要在 OpenResty 或后端静态资源映射中确保 `/uploads/**` 可访问。

## 8. 部署设计

推荐部署结构：

```text
Browser
  -> Cloudflare / DNS
  -> OpenResty
      /            -> Next.js static export files
      /api/**      -> Spring Boot backend :8080
      /uploads/**  -> backend or upload directory
  -> MySQL
```

前端静态导出后复制到站点目录。

后端打包为 jar，通过 systemd 运行。

MySQL 使用 1Panel 应用商店或 Docker 安装，数据库表手动导入。

## 9. 后续扩展建议

- 为工作经历、作品链接、项目链接继续补充修改功能。
- 为证书 PDF 增加后端上传逻辑，避免手动填写 URL。
- 为上传目录做定期备份。
- 后端 token 改为标准 JWT 或 session cookie。
- 加入 Flyway 后可以把手动 SQL 纳入版本管理。
- 客户端可以复用同一套 `/api/public/**` 和 `/api/admin/**` 接口。
