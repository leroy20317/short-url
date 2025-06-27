<!--
 * @Author: leroy
 * @Date: 2024-07-03 09:17:45
 * @LastEditTime: 2025-06-27 15:37:23
 * @Description:
-->

### 短链系统

环境变量 .env

|     Name     |                      Example                      |       Remark        |
| :----------: | :-----------------------------------------------: | :-----------------: |
|  ADMIN_USER  |                 username:password                 |   管理者账号密码    |
|  JWT_SECRET  |                      secret                       |    JWT生成的秘钥    |
| DATABASE_URL | postgresql://username:password@host:port/database | PostgreSql 连接 url |

## 🏗️ 项目架构

### 技术栈

- **前端框架**: Next.js 15 (React 18)
- **UI组件库**: Ant Design 5 + Ant Design Pro Components
- **样式**: Tailwind CSS 4 + CSS Modules
- **语言**: TypeScript
- **数据库**: PostgreSQL + Drizzle ORM
- **缓存**: Redis
- **身份验证**: JWT
- **部署**: Docker + Docker Compose

### 项目结构

```
short-url/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── [key]/             # 动态路由 - 短链重定向
│   │   │   └── route.ts       # 短链解析和跳转逻辑
│   │   ├── api/               # API 路由
│   │   │   ├── health/        # 健康检查接口
│   │   │   ├── shorten/       # 短链管理接口
│   │   │   │   ├── edit/      # 编辑短链
│   │   │   │   └── list/      # 短链列表
│   │   │   └── user/          # 用户认证接口
│   │   │       ├── check/     # 用户状态检查
│   │   │       └── login/     # 用户登录
│   │   ├── global.css         # 全局样式
│   │   ├── layout.tsx         # 根布局组件
│   │   └── page.tsx           # 首页
│   ├── components/            # React 组件
│   │   ├── Login/             # 登录组件
│   │   └── Main/              # 主页面组件
│   └── utils/                 # 工具函数
│       ├── postgreSql.ts      # PostgreSQL 数据库连接和表结构
│       ├── redis.ts           # Redis 缓存连接
│       └── util.ts            # 通用工具函数
├── type/
│   └── global.d.ts            # 全局类型定义
├── public/                    # 静态资源
├── docker-compose.yaml        # Docker 编排配置
├── Dockerfile                 # Docker 镜像构建
└── 配置文件...                # 各种配置文件
```

### 数据模型

```sql
-- links 表结构
CREATE TABLE links (
  id SERIAL PRIMARY KEY,           -- 自增主键
  title VARCHAR(10),               -- 短链标题 (可选)
  key VARCHAR(10) NOT NULL UNIQUE, -- 短链标识符
  original TEXT NOT NULL,          -- 原始URL
  expired TIMESTAMP WITH TIME ZONE, -- 过期时间 (可选)
  update TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- 更新时间
  clicks INTEGER DEFAULT 0         -- 点击统计
);
```

### 核心功能

- **短链生成**: 将长URL转换为短链接
- **短链管理**: 支持编辑、删除、查看统计
- **访问统计**: 记录短链点击次数
- **过期管理**: 支持设置短链过期时间
- **用户认证**: 基于JWT的管理员认证
- **缓存优化**: Redis缓存提升访问性能

### 部署方式

项目支持 Docker 容器化部署：

```bash
# 构建并启动服务
docker compose up -d

# 访问应用
http://localhost:5600
```
