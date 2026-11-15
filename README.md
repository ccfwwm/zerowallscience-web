# ZeroWall Science 官网

面向医学与生命科学研究的科研 Agent 工作台。首页按科研 Agent、虚拟基因敲除、医疗科研、文献复现、可编辑 PPTX 的顺序展示，图片、视频与音乐创作位于其后。

## 本地运行

```powershell
pnpm install
pnpm dev
```

生产预览：

```powershell
pnpm build
pnpm preview --host 127.0.0.1 --port 4323
```

中文 `/`，英文 `/en/`，原 `/zh/` 跳转到中文首页。

## 结构

- `src/content/site.ts`：中英文内容与五项能力定义。
- `src/components/ResearchPage.astro`：页面结构。
- `src/components/PromoVideo.astro`：用户宣传片、原视频封面与移动端内联播放。
- `src/components/FeatureVisual.astro`：双语流程示意与交互展示。
- `src/scripts/site.ts`：滚动章节、键盘页签、菜单及图片预览。
- `src/scripts/motion.ts`：轻量区块出场、页签指示与原生滚动流程线。
- `src/lib/latest-release.mjs`：全页共享最新版本请求，3 秒超时并保留构建地址。
- `public/assets/v2/`：原始 ZeroWall 图标、现有插画、真实产品截图及分享封面。
- `design/branding/zerowall-icon.png`：用户指定的原始图标，网站标志和完整尺寸 favicon 保持文件字节一致。
- `design/manifest.json`：图片用途、来源、生成参数、尺寸、双语替代文本及 SHA-256。
- `design/PINE-REDESIGN.md`：当前松柏青设计、关键状态、独立评审与验收证据。
- `public/fonts/`：本地 Bricolage Grotesque、Inter、JetBrains Mono 及各自 OFL 授权文件。
- `public/samples/zerowall-editable-research.pptx`：由软件实际导出引擎生成的三页可编辑示例。

首屏采用标题与真实科研工具界面并排布局，手机按文字、下载、产品画面排列，宣传片在其后页内播放。全站为灰白与白色内容面、深松绿标题和青绿操作控件，保留原始彩色标志。五项能力在所有尺寸下自然连续展开，桌面左右交错，手机纵向排列。原生锚点和历史导航不接管滚轮。视频点击后才请求 MP4，离屏或切换后台时暂停；无脚本保留原生控件。按钮、页签、区块与流程线采用轻量反馈，减少动态效果或增强加载失败时内容完整可见。页面内容和 EXE 下载链接直接存在于 HTML。

## 验证

日常视觉检查使用开发服务器、类型检查和相关浏览器脚本即可；静态验证读取 dist，须在明确需要生产构建时运行，避免检查旧产物。

```powershell
pnpm test
pnpm check
pnpm build
node scripts/verify-static.mjs
# 先运行上面的生产预览，再执行：
pnpm test:browser
node scripts/verify-promo.mjs
node scripts/verify-download.mjs
```

浏览器验证与素材整理脚本默认使用当前 Windows 环境的 Codex 内置 Playwright 和 Sharp。`SITE_PREVIEW_URL` 可指定其他预览地址。网站运行和生产构建不依赖这些本地工具。完整下载校验会保存安装包到被 Git 忽略的 `artifacts/download-verification/`。

本次改版的浏览器、视频与独立评审记录位于 `artifacts/pine-redesign/`，详见 `design/PINE-REDESIGN.md`。`design/review.html` 和 `artifacts/verification/` 为历史记录。

## 素材与事实边界

本次复用既有素材，没有生成或购买新图片。历史辅助插画按指定的 `gpt-image-2.5-sunburst`、`quality=high` 生成。科研网络和图表演示均标明示意性质。真实截图来自 8.4.0 发布 Host 与离线插件的独立空白配置，影像截图展示文件选择界面。当前页面截图标注 8.4.0，不作为 9.0 的界面截图。PPTX 的历史导出验证含原生对象检查、软件回读和逐页渲染检查；网页保留明确标识的对象演示。社群二维码已替换为用户于 2026-11-15 提供的新邀请，网页标注有效至 2026-11-22。

## 生产发布

生产站点为 https://zerowallscience.org/，运行于现有 uscavaslinux 服务器。官网静态目录为 `/var/www/zerowallscience-web/current`，文档和管理后台由现有独立服务提供。

当前仓库的旧 GitHub Deploy 工作流处于停用状态，其旧 Nginx 配置不包含完整文档路由，不应用于本次发布。`deploy/static-site.sh` 仅将经过哈希校验的 Astro 构建切换到新的版本目录，共用现有部署锁，并在站点或文档健康检查失败时恢复上一版。它不安装 Nginx 配置，也不重启后端。

发布前运行测试、类型检查和构建，为构建生成 SHA256SUMS，再上传静态归档。发布后验证中文、英文、文档、后台、二维码、原生下载和已有服务状态。发布记录保存在 `artifacts/production/`。

文档系统仓库另有完整站点发布流程。未来发布该系统时，应同步其中的官网源码，避免它自带的旧 `website/` 产物覆盖新版官网。
