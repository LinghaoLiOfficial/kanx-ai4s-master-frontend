# Project Technical Documentation

## Overview

基于 Next.js 16、React 19 和 Tailwind CSS 4 的前端。`/` 是状态页，`/components` 是深色粉紫知识管理组件展厅；`/login`、`/register`、`/verify-email` 与 `/workspace` 构成认证流程。

## Architecture

通用组件位于 `src/components/ui/`，知识管理复合组件位于 `src/components/knowledge/`；认证共享界面位于 `src/components/auth/`。API client 在内存保存短期 access token，通过后端 HttpOnly refresh cookie 与可读 CSRF cookie 恢复会话。

## Key Files and Directories

- `src/app/globals.css`: 主题令牌与页面视觉样式。
- `components.json`: shadcn/ui 配置。
- `src/components/ui/`: 基础组件源码。
- `src/components/knowledge/`: 知识组件及测试。
- `src/components/auth/`: 认证页面外壳、密码输入和错误映射。
- `src/lib/api/client.ts`: 后端请求、401 刷新、登录注册及退出逻辑。
- `src/app/workspace/page.tsx`: 工作区文件管理、搜索、类型筛选、分页及文件操作。
- `src/app/workspace/files/[fileId]/page.tsx`: Mindmap 编辑器、v2 JSON 转换与 800ms 自动保存。

## Setup and Runbook

使用 `pnpm dev --port 3000` 启动开发服务。认证功能要求后端运行于 `NEXT_PUBLIC_API_BASE_URL`（默认 `http://localhost:8000`），且后端允许前端 Origin 并启用 credentials。`predev` 会执行 `pnpm install --frozen-lockfile`。

## Testing and Verification

可运行 `pnpm lint`、`pnpm test`、`pnpm exec tsc --noEmit` 和 `pnpm build`。2026-09-30 工作区实现验证为 18 项前端测试、lint、TypeScript 和生产构建通过；后端 `uv run pytest -q` 通过 9 项。

## Current Decisions and Conventions

组件库使用深色基底与 `#FF0076` 到 `#590FB7` 的粉紫渐变；`.gallery-surface` 使用固定视口的深粉到深紫对角渐变，叠加大范围柔和径向晕染，滚动时保持连续。主要操作使用 `.brand-gradient-control`，次级徽标与状态使用 `.brand-gradient-soft` / `.brand-gradient-subtle`，面板、弹层和输入框分别使用 `.glass-surface`、`.glass-popover`、`.glass-field`。警示状态保留独立颜色。根状态页保留独立外观。展厅使用本地演示数据。

默认主 Badge 不使用透明实体边框，避免渐变背景穿过边框后在右侧和底部形成双色轮廓；secondary 与 outline Badge 保留细描边。

“色彩与表面”的主渐变样本同样不使用半透明边框，仅通过圆角裁切展示品牌渐变，避免边缘产生色相偏差。

知识文档结果使用 `DocumentRow` 纵向玻璃卡片，并在展厅按响应式网格排列：默认 1 列、`sm` 2 列、`xl` 3 列。卡片固定最小高度，作者、集合与更新时间置于底部，以保证同一行对齐；悬浮交互复用 `Card` 导出的 `interactiveCardClassName`，与工作区文件卡片保持一致且不产生位置移动。

展厅当前提供 6 条本地知识文件示例，分别覆盖研究笔记、产品资料和灵感存档，供网格、搜索与标签筛选演示使用。

认证以前端适配后端为原则：注册密码至少 12 位，注册与重新发送验证使用通用响应；登录响应只包含 token 元数据，当前用户固定读取 `GET /users/me` 的 `id`、`email`、`display_name`、`email_verified`。登录默认进入 `/workspace`，并允许安全的站内 `next` 路径。

工作区文件属于 `/users/me/context` 返回的第一个个人组织。支持 `mindmap` 和 `markdown`；Markdown 首版仅允许创建、重命名和删除。新建文件后停留在列表并刷新数据；侧栏只保留导航，创建入口位于页面工具栏；文件卡片通过通用 `Card interactive` 状态提供指针、悬浮高亮和整卡打开能力，交互态使用重要性规则覆盖 `.glass-surface` 的基础表面样式，并仅改变边框、背景和阴影，不产生位置移动，菜单按钮保持独立交互。桌面宽屏文件网格使用四列，更新时间显示到分钟。Mindmap 使用 `kanx-mindmap@0.1.0-rc.1`，通过 `parseDocument`/`serializeDocument` 与后端 v2 JSON 文档互转，变更防抖 800ms 保存并显示状态；编辑器内部标题为“Mindmap 编辑器”，外层文件标题下显示文件类型 `Mindmap`。

工作区 Mindmap 通过 `workspace-mindmap-editor` 为编辑器根节点建立 `position: relative` 定位上下文，并让配色弹层父级使用编辑器内的确定高度；面板自身保持 `max-height: 100%`，由 `.palette-options` 在内容超出时提供内部滚动，避免组件高度小于视口时弹层溢出页面。该覆盖样式位于 `src/app/globals.css`，不要直接修改 `node_modules/kanx-mindmap`。

Mindmap 页面关闭或路由离开时由 React 卸载 `MindMapEditor`。`kanx-mindmap` 通过 effect cleanup 移除全局键盘、指针和粘贴监听，注销 viewport，清除持久化 timer 并取消 store 订阅；组件 API 未提供 `destroy`/`dispose` 实例方法。页面自身只清理自动保存 debounce timer，已经发出的加载或保存请求仍可能继续完成。

## Known Issues and Follow-ups

内置浏览器连接目前可能返回 `unsupported Codex auth method: apikey`；已运行的 Chrome 窗口可用于实际 UI 检查。当前工作区含先前未提交的组件及 `next-env.d.ts` 改动，勿覆盖。

完整认证端到端流程需要本地 PostgreSQL、迁移、邮件 dispatcher/Mailpit 和后端 API 同时运行；前端单元测试使用模拟响应验证接口契约。

Mindmap 关闭后的网络请求没有 AbortController 取消机制，若需要避免卸载后更新状态或无效保存，应在页面请求层补充取消信号。

下拉组件统一使用玻璃弹层表面：`SelectContent` 默认采用 popper 定位并至少匹配触发器宽度，`DropdownMenuContent` 至少匹配触发器宽度且允许按内容变宽，`ComboboxContent` 使用锚点宽度并限制在可用视口内；各类下拉项通过全局 `min-height: 2rem` 保持可扫描的行距。浏览器自动化检查受本机 Codex 浏览器授权方式限制，需手动在 Chrome 复核视觉细节。

命令菜单 `src/components/ui/command.tsx` 的输入区使用透明玻璃背景，选中项使用粉紫渐变；`CommandInput` 的可见焦点环仍可作为后续可访问性改进项。
