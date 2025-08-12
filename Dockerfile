# 第一阶段：安装依赖
FROM node:22-alpine

WORKDIR /app

# 安装PNPM (利用已有缓存层)
RUN npm install -g pnpm

# 首先只复制依赖相关的文件 (充分利用依赖缓存)
COPY package.json pnpm-lock.yaml ./

# 使用缓存挂载优化依赖安装
# BuildKit缓存：即使镜像源改变，依赖安装缓存仍然有效
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    --mount=type=cache,id=pnpm-cache,target=/root/.pnpm-store \
    pnpm config set store-dir /pnpm/store && \
    pnpm install --prod --frozen-lockfile

# 然后复制其他文件
COPY build ./build
COPY public ./public
COPY .env ./
COPY next.config.js ./

# 暴露应用端口
EXPOSE 5600

# 启动应用
CMD ["pnpm", "start"]
