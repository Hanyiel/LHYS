# LHYS 部署文档

## 1. 部署目标

将本地开发的 Next.js 前端、Spring Boot 后端和 MySQL 数据库迁移到服务器，使用 1Panel 管理服务器应用，并通过域名访问站点。

## 2. 服务器组件

推荐组件：

- 1Panel：服务器运维面板。
- OpenResty：静态站点和反向代理。
- MySQL：业务数据库。
- Java 21：运行 Spring Boot jar。
- Node.js：服务器上构建前端时需要。
- Git：拉取项目代码。

## 3. DNS 与域名

在域名服务商或 Cloudflare 配置：

```text
A     @       服务器 IPv4
CNAME www     luhanyu.com
```

如果使用 Cloudflare 代理，注意 SSL 模式建议使用 Full 或 Full strict。

## 4. MySQL 部署

### 4.1 创建数据库

在 1Panel MySQL 管理页面或 Navicat 中创建数据库：

```sql
CREATE DATABASE LHYS CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4.2 导入表结构

使用项目中的 SQL 文档作为基础：

```text
docs/database/admin_users.sql
docs/database/profile_schema.sql
```

如果后续新增了 `profile_skill_items` 和 `project_links`，也需要在服务器数据库中确认这两张表存在。

### 4.3 导入管理员数据

首个管理员可以从本地数据库导出加密后的 `password_hash`，再导入服务器数据库。

不要在生产数据库中保存明文密码。

## 5. 后端部署

### 5.1 配置环境变量

建议使用 systemd 环境变量或 `.env` 管理：

```env
SPRING_DATASOURCE_URL=jdbc:mysql://127.0.0.1:3306/LHYS?useUnicode=true&characterEncoding=utf8mb4&serverTimezone=Asia/Shanghai
SPRING_DATASOURCE_USERNAME=lhys_user
SPRING_DATASOURCE_PASSWORD=your_password
LHYS_UPLOAD_ROOT=/var/www/LHYS/uploads
LHYS_UPLOAD_PUBLIC_PATH=/uploads
```

### 5.2 打包后端

在服务器项目目录：

```powershell
cd apps/api
./mvnw -DskipTests package
```

生成文件：

```text
apps/api/target/api-0.0.1-SNAPSHOT.jar
```

### 5.3 systemd 运行示例

```ini
[Unit]
Description=LHYS Backend
After=network.target

[Service]
WorkingDirectory=/var/www/LHYS/apps/api
ExecStart=/usr/bin/java -jar /var/www/LHYS/apps/api/target/api-0.0.1-SNAPSHOT.jar
Restart=always
RestartSec=5
Environment=SPRING_DATASOURCE_URL=jdbc:mysql://127.0.0.1:3306/LHYS?useUnicode=true&characterEncoding=utf8mb4&serverTimezone=Asia/Shanghai
Environment=SPRING_DATASOURCE_USERNAME=lhys_user
Environment=SPRING_DATASOURCE_PASSWORD=your_password
Environment=LHYS_UPLOAD_ROOT=/var/www/LHYS/uploads
Environment=LHYS_UPLOAD_PUBLIC_PATH=/uploads

[Install]
WantedBy=multi-user.target
```

常用命令：

```bash
sudo systemctl daemon-reload
sudo systemctl enable backend
sudo systemctl restart backend
sudo journalctl -u backend -f
```

## 6. 前端部署

### 6.1 构建

```bash
cd apps/web
npm install
npm run build
```

如果 `next.config.ts` 使用 `output: "export"`，构建产物在：

```text
apps/web/out
```

### 6.2 复制到 OpenResty 站点目录

示例：

```bash
sudo rm -rf /opt/1panel/www/sites/luhanyu.com/index/*
sudo cp -r /var/www/LHYS/apps/web/out/* /opt/1panel/www/sites/luhanyu.com/index/
sudo chmod -R 755 /opt/1panel/www/sites/luhanyu.com/index
```

## 7. OpenResty 反向代理

推荐规则：

```nginx
location /api/ {
    proxy_pass http://127.0.0.1:8080/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location /uploads/ {
    proxy_pass http://127.0.0.1:8080/uploads/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

如果选择由 OpenResty 直接读取上传目录，也可以使用 `alias`：

```nginx
location /uploads/ {
    alias /var/www/LHYS/uploads/;
}
```

两种方式二选一即可。

## 8. 本地与生产环境差异

### 8.1 前端 API 地址

本地：

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

生产：

```env
NEXT_PUBLIC_API_BASE_URL=
```

生产环境由 OpenResty 把 `/api/**` 转发给后端。

### 8.2 图片预览

数据库保存的是：

```text
/uploads/avatars/xxx.jpg
```

前端本地会拼成：

```text
http://localhost:8080/uploads/avatars/xxx.jpg
```

生产环境会访问：

```text
https://your-domain.com/uploads/avatars/xxx.jpg
```

## 9. 部署检查清单

- 域名 A 记录指向服务器。
- 服务器 80 和 443 端口开放。
- MySQL 容器或服务正常运行。
- 数据库和表已创建。
- 首个管理员数据已导入。
- 后端 systemd 服务运行正常。
- `curl http://127.0.0.1:8080/api/...` 能访问后端。
- OpenResty `/api/**` 反代正常。
- OpenResty `/uploads/**` 能访问图片。
- 前端静态文件已复制到站点目录。
- 浏览器能登录工作台并保存资料。

## 10. 常见问题

### 登录接口 curl 成功，浏览器失败

检查 OpenResty 是否把 `/api/**` 正确代理到 8080，检查请求是否带了 `Content-Type: application/json`。

### 一寸照本地能访问，域名访问 404

说明 `/uploads/**` 没有被代理或映射。需要在 OpenResty 增加 `/uploads/` 规则。

### 本地 API 访问到前端 3000 导致 404

检查 `apps/web/.env.local` 是否配置：

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

修改后需要重启 Next.js dev server。
