# 🔗 短链系统 (Short URL)

一个现代化的短链接管理系统，基于 Next.js 15 + TypeScript 构建，具备零停机部署和自动回滚能力。

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE) [![Node.js](https://img.shields.io/badge/Node.js-22+-green.svg)](https://nodejs.org/) [![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/) [![TypeScript](https://img.shields.io/badge/TypeScript-5.8+-blue.svg)](https://www.typescriptlang.org/)

## ✨ 核心特性

- 🚀 **高性能**: Next.js 15 + React 18 构建，支持 SSR/SSG
- 🎨 **现代化 UI**: Ant Design 5 + Tailwind CSS 4 设计语言
- 🔐 **安全认证**: JWT 身份验证系统
- 📊 **访问统计**: 实时点击量统计和分析
- ⚡ **高速缓存**: Redis 缓存优化访问性能
- 🕰️ **过期管理**: 支持自定义短链过期时间
- 🐳 **容器化部署**: Docker + Docker Compose 一键部署
- 🔄 **零停机发布**: 自动化 CI/CD + 健康检查 + 失败回滚

## 🛠️ 技术栈

### 前端技术

- **框架**: Next.js 15 (React 18)
- **语言**: TypeScript 5.8+
- **UI 库**: Ant Design 5 + Ant Design Pro Components
- **样式**: Tailwind CSS 4 + CSS Modules
- **构建工具**: SWC + Webpack
- **代码质量**: ESLint + Prettier + Stylelint + Husky

### 后端技术

- **运行时**: Node.js 22+
- **数据库**: PostgreSQL + Drizzle ORM
- **缓存**: Redis
- **身份验证**: JWT (jsonwebtoken)
- **API**: Next.js App Router

### DevOps 工具

- **容器化**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **包管理**: PNPM
- **部署**: 零停机部署 + 自动回滚

## 🚀 快速开始

### 环境要求

- Node.js 22+
- PNPM 10+
- PostgreSQL 13+
- Redis 6+
- Docker & Docker Compose (可选)

### 安装部署

#### 方式一：Docker 部署 (推荐)

```bash
# 1. 克隆项目
git clone
cd short-url

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，配置数据库连接等信息

# 3. 启动服务
docker compose up -d

# 4. 访问应用
open http://localhost:5600
```

#### 方式二：本地开发

```bash
# 1. 安装依赖
pnpm install

# 2. 配置环境变量
cp .env.example .env

# 3. 启动开发服务器
pnpm dev

# 4. 构建生产版本
pnpm build
pnpm start
```

### 环境变量配置

创建 `.env` 文件并配置以下变量：

| 变量名 | 示例值 | 说明 |
| --- | --- | --- |
| `DATABASE_URL` | `postgresql://username:password@host:port/database` | PostgreSQL 数据库连接字符串 |
| `ADMIN_USER` | `admin:secret123` | 管理员账号密码 (格式: username:password) |
| `JWT_SECRET` | `your-super-secret-jwt-key` | JWT 签名密钥 |
| `REDIS_URL` | `redis://localhost:6379` | Redis 连接字符串 (可选) |

## 📖 API 文档

### 核心端点

#### 短链重定向

```http
GET /{key}
```

- **功能**: 重定向到原始 URL
- **参数**: `key` - 短链标识符
- **响应**: 302 重定向 / 404 未找到 / 410 已过期

#### 健康检查

```http
GET /api/health
```

- **功能**: 系统健康状态检查
- **响应**: `{"status": "ok"}`

### 管理 API (需要认证)

#### 用户登录

```http
POST /api/user/login
Content-Type: application/json

{
  "username": "admin",
  "password": "secret123"
}
```

#### 用户状态检查

```http
GET /api/user/check
```

#### 短链列表

```http
GET /api/shorten/list
```

#### 短链管理

```http
POST /api/shorten/edit
Content-Type: application/json

{
  "type": "add|edit|delete",
  "key": "abc123",
  "title": "示例标题",
  "original": "https://example.com",
  "expired": "2024-12-31T23:59:59Z"
}
```

## 🏗️ 项目架构

### 目录结构

```
short-url/
├── src/                        # 源代码目录
│   ├── app/                    # Next.js App Router
│   │   ├── [key]/             # 动态路由 - 短链重定向
│   │   │   └── route.ts       # 重定向逻辑 + 访问统计
│   │   ├── api/               # RESTful API 路由
│   │   │   ├── health/        # 健康检查端点
│   │   │   ├── shorten/       # 短链管理 API
│   │   │   │   ├── edit/      # 增删改操作
│   │   │   │   └── list/      # 列表查询
│   │   │   └── user/          # 用户认证 API
│   │   │       ├── check/     # 登录状态验证
│   │   │       └── login/     # 用户登录
│   │   ├── global.css         # 全局样式定义
│   │   ├── layout.tsx         # 根布局组件
│   │   └── page.tsx           # 首页组件
│   ├── components/            # React 组件库
│   │   ├── Login/             # 登录表单组件
│   │   └── Main/              # 主界面组件
│   └── utils/                 # 工具函数库
│       ├── postgreSql.ts      # 数据库连接 + 表结构定义
│       ├── redis.ts           # Redis 缓存工具
│       └── util.ts            # 通用工具函数
├── type/                      # TypeScript 类型定义
│   └── global.d.ts           # 全局类型声明
├── public/                   # 静态资源文件
├── .github/workflows/        # GitHub Actions CI/CD
├── docker-compose.yaml       # Docker 编排配置
├── Dockerfile               # Docker 镜像构建文件
└── 配置文件...               # ESLint, Prettier, Tailwind 等配置
```

### 数据模型

```sql
-- links 表结构 (PostgreSQL)
CREATE TABLE links (
  id SERIAL PRIMARY KEY,                    -- 自增主键
  title VARCHAR(10),                        -- 短链标题 (可选，最长10字符)
  key VARCHAR(10) NOT NULL UNIQUE,          -- 短链标识符 (必填，唯一索引)
  original TEXT NOT NULL,                   -- 原始URL (必填，无长度限制)
  expired TIMESTAMP WITH TIME ZONE,         -- 过期时间 (可选，支持时区)
  update TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- 更新时间 (自动维护)
  clicks INTEGER DEFAULT 0                  -- 点击统计 (默认为0)
);

-- 索引优化
CREATE INDEX idx_links_key ON links(key);
CREATE INDEX idx_links_expired ON links(expired) WHERE expired IS NOT NULL;
```

### 核心功能流程

#### 1. 短链生成流程

```mermaid
graph LR
    A[输入长URL] --> B[生成随机Key]
    B --> C[检查Key唯一性]
    C --> D{Key存在?}
    D -->|是| B
    D -->|否| E[保存到数据库]
    E --> F[返回短链]
```

#### 2. 访问重定向流程

```mermaid
graph LR
    A[访问短链] --> B[解析Key]
    B --> C[查询数据库]
    C --> D{记录存在?}
    D -->|否| E[返回404]
    D -->|是| F{已过期?}
    F -->|是| G[返回410]
    F -->|否| H[更新点击数]
    H --> I[重定向到原URL]
```

## 🔧 开发指南

### 本地开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器 (热重载)
pnpm dev

# 代码质量检查
pnpm lint

# 代码格式化
pnpm prettier

# 类型检查
pnpm type-check

# 构建分析
pnpm analyze
```

### 代码提交规范

项目使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```bash
# 功能开发
git commit -m "feat: 添加短链批量导入功能"

# 问题修复
git commit -m "fix: 修复过期时间显示错误"

# 文档更新
git commit -m "docs: 更新API文档示例"

# 性能优化
git commit -m "perf: 优化数据库查询性能"
```

### 代码质量保证

- **Lint 检查**: ESLint + TypeScript ESLint
- **代码格式**: Prettier (自动格式化)
- **样式规范**: Stylelint (CSS/SCSS 检查)
- **提交钩子**: Husky + lint-staged (提交前检查)
- **类型安全**: TypeScript 严格模式

## 🚀 部署指南

### 生产环境部署

项目支持多种部署方式，推荐使用 Docker 容器化部署。

#### 1. Docker 部署

```bash
# 1. 准备环境配置
cp .env.example .env
vim .env  # 配置生产环境变量

# 2. 构建并启动
docker compose up -d

# 3. 查看运行状态
docker compose ps
docker compose logs -f short-url

# 4. 健康检查
curl http://localhost:5600/api/health
```

#### 2. 手动部署

```bash
# 1. 构建生产版本
pnpm build

# 2. 启动生产服务器
pnpm start

# 3. 使用 PM2 管理进程 (推荐)
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### CI/CD 流水线

项目内置了完整的 GitHub Actions 工作流：

#### 特性

- ✅ 自动化构建和测试
- ✅ Docker 镜像构建和推送
- ✅ 零停机部署 (Rolling Update)
- ✅ 健康检查验证
- ✅ 失败自动回滚
- ✅ 部署状态通知

#### 配置 Secrets

在 GitHub 仓库设置中添加以下 Secrets：

| Secret 名称    | 说明               |
| -------------- | ------------------ |
| `REMOTE_HOST`  | 部署服务器 IP 地址 |
| `REMOTE_PORT`  | SSH 端口 (默认 22) |
| `REMOTE_USER`  | SSH 用户名         |
| `ACCESS_TOKEN` | SSH 私钥           |
| `DATABASE_URL` | 生产环境数据库连接 |
| `ADMIN_USER`   | 生产环境管理员账号 |
| `JWT_SECRET`   | 生产环境 JWT 密钥  |

### 性能优化

#### 1. 缓存策略

- **Redis 缓存**: 热点短链缓存，减少数据库压力
- **静态资源**: CDN 加速 + Gzip 压缩
- **API 缓存**: 合理的 HTTP 缓存头设置

#### 2. 数据库优化

- **索引优化**: key 字段唯一索引，过期时间条件索引
- **连接池**: PostgreSQL 连接池复用
- **查询优化**: 避免 N+1 查询，使用 prepared statements

#### 3. 监控告警

- **健康检查**: `/api/health` 端点监控
- **性能指标**: 响应时间、错误率监控
- **资源监控**: CPU、内存、磁盘使用率

## 🤝 贡献指南

欢迎参与项目贡献！请遵循以下步骤：

### 1. 开发流程

```bash
# 1. Fork 项目到个人仓库
# 2. 克隆到本地
git clone

# 3. 创建功能分支
git checkout -b feature/amazing-feature

# 4. 提交更改
git commit -m "feat: 添加惊人的功能"

# 5. 推送到分支
git push origin feature/amazing-feature

# 6. 创建 Pull Request
```

### 2. 代码规范

- 遵循项目现有的代码风格
- 为新功能编写测试用例
- 更新相关文档
- 确保所有测试通过
