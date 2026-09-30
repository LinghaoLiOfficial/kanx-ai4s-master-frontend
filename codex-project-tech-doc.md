# Project Technical Documentation

## Overview

基于 Next.js 16、React 19 和 Tailwind CSS 4 的前端。`/` 是状态页，`/components` 是深色粉紫知识管理组件展厅。

## Architecture

通用组件位于 `src/components/ui/`，知识管理复合组件位于 `src/components/knowledge/`；展厅在 `src/app/components/page.tsx`。状态页使用 `src/app/(status)/` 下的专属布局。

## Key Files and Directories

- `src/app/globals.css`: 主题令牌与页面视觉样式。
- `components.json`: shadcn/ui 配置。
- `src/components/ui/`: 基础组件源码。
- `src/components/knowledge/`: 知识组件及测试。

## Setup and Runbook

使用 `pnpm dev --port 3000` 启动开发服务，访问 `http://localhost:3000/components`。`predev` 会执行 `pnpm install --frozen-lockfile`。

## Testing and Verification

可运行 `pnpm lint`、`pnpm test`、`pnpm exec tsc --noEmit` 和 `pnpm build`。2026-09-30 已在 Chrome 实测展厅桌面、400px 响应式视口、Select 浮层、搜索筛选和弹窗；lint、类型检查、10 项测试及构建通过，`/` 和 `/components` 均返回 HTTP 200。

## Current Decisions and Conventions

组件库使用深色基底与 `#FF0076` 到 `#590FB7` 的粉紫渐变；`.gallery-surface` 使用固定视口的深粉到深紫对角渐变，叠加大范围柔和径向晕染，滚动时保持连续。主要操作使用 `.brand-gradient-control`，次级徽标与状态使用 `.brand-gradient-soft` / `.brand-gradient-subtle`，面板、弹层和输入框分别使用 `.glass-surface`、`.glass-popover`、`.glass-field`。警示状态保留独立颜色。根状态页保留独立外观。展厅使用本地演示数据。

默认主 Badge 不使用透明实体边框，避免渐变背景穿过边框后在右侧和底部形成双色轮廓；secondary 与 outline Badge 保留细描边。

“色彩与表面”的主渐变样本同样不使用半透明边框，仅通过圆角裁切展示品牌渐变，避免边缘产生色相偏差。

知识文档结果使用 `DocumentRow` 纵向玻璃卡片，并在展厅按响应式网格排列：默认 1 列、`sm` 2 列、`xl` 3 列。卡片固定最小高度，作者、集合与更新时间置于底部，以保证同一行对齐。

展厅当前提供 6 条本地知识文件示例，分别覆盖研究笔记、产品资料和灵感存档，供网格、搜索与标签筛选演示使用。

## Known Issues and Follow-ups

内置浏览器连接目前可能返回 `unsupported Codex auth method: apikey`；已运行的 Chrome 窗口可用于实际 UI 检查。当前工作区含先前未提交的组件及 `next-env.d.ts` 改动，勿覆盖。

命令菜单 `src/components/ui/command.tsx` 的输入区实际使用约 5% 透明背景与模糊效果，选中项粉紫渐变正常；但 `CommandInput` 不带 `data-slot="input-group-control"`，且输入本身隐藏 outline，键盘聚焦时没有可见焦点环，后续需修复。2026-09-30 已在内置浏览器核查。
