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
- `src/components/FeatureVisual.astro`：双语流程示意与交互展示。
- `src/scripts/site.ts`：滚动章节、键盘页签、菜单及图片预览。
- `src/scripts/brand-scene.ts`：延迟加载的品牌三维动画。
- `src/lib/latest-release.mjs`：全页共享最新版本请求，3 秒超时并保留构建地址。
- `public/assets/v2/`：原始 ZeroWall 图标、基于原图标制作的首屏视觉、插画、产品截图及分享封面。
- `design/branding/zerowall-icon.png`：用户指定的原始图标，网站标志和完整尺寸 favicon 保持文件字节一致。
- `design/manifest.json`：图片用途、来源、生成参数、尺寸、双语替代文本及 SHA-256。
- `design/TYPOGRAPHY-REVIEW.md`：参考站字体与版式测量、字号对照及可读性验收规则。
- `public/fonts/`：本地 Montserrat 可变字体及开放字体授权文件。
- `public/samples/zerowall-editable-research.pptx`：由软件实际导出引擎生成的三页可编辑示例。

五项能力在至少 1200 × 780px 的桌面使用固定舞台，功能区左右交错。正文至少 16px、标题字重 700；较窄或较矮屏幕、低性能设备及减少动态效果时使用正常文档布局。WebGL 不可用时显示静态海报。页面内容和 EXE 下载链接直接存在于 HTML。

## 验证

```powershell
pnpm test
pnpm check
pnpm build
node scripts/verify-static.mjs
# 先运行上面的生产预览，再执行：
pnpm test:browser
node scripts/verify-download.mjs
```

浏览器验证与素材整理脚本默认使用当前 Windows 环境的 Codex 内置 Playwright 和 Sharp。`SITE_PREVIEW_URL` 可指定其他预览地址。网站运行和生产构建不依赖这些本地工具。完整下载校验会保存安装包到被 Git 忽略的 `artifacts/download-verification/`。

`design/review.html` 提供桌面、手机与交互截图总览；检查记录位于 `artifacts/verification/`。

## 素材与事实边界

辅助插画按指定的 `gpt-image-2.5-sunburst`、`quality=high` 生成。科研网络和图表演示均标明示意性质。真实截图来自 8.4.0 发布 Host 与离线插件的独立空白配置，影像截图展示文件选择界面。PPTX 含明确标识的演示数据，并完成原生对象检查、软件回读和逐页渲染检查。

## 生产发布

生产站点为 https://zerowallscience.org/，运行于现有 uscavaslinux 服务器。官网静态目录为 `/var/www/zerowallscience-web/current`，文档和管理后台由现有独立服务提供。

当前仓库的旧 GitHub Deploy 工作流处于停用状态，其旧 Nginx 配置不包含完整文档路由，不应用于本次发布。`deploy/static-site.sh` 仅将经过哈希校验的 Astro 构建切换到新的版本目录，共用现有部署锁，并在站点或文档健康检查失败时恢复上一版。它不安装 Nginx 配置，也不重启后端。

发布前运行测试、类型检查和构建，为构建生成 SHA256SUMS，再上传静态归档。发布后验证中文、英文、文档、后台、二维码、原生下载和已有服务状态。发布记录保存在 `artifacts/production/`。

文档系统仓库另有完整站点发布流程。未来发布该系统时，应同步其中的官网源码，避免它自带的旧 `website/` 产物覆盖新版官网。
