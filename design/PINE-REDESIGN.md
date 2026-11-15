# ZeroWall Science 官网改版：松柏青

日期：2026-11-15。范围：中文首页、英文首页与响应式界面。已完成构建并通过既有静态站点发布流程；未修改文档/后台服务。

## 设计目标与事实

面向医学与生命科学研究者，让访客先看懂科研工作台，再下载 Windows 客户端。设计北极星：**像走进明亮的科研工作台，先看懂产品，再下载开始。**

采用用户选定的②松柏青，取代原深色设计和中途的黄绿色方向。借鉴 afkmini 的 Bricolage Grotesque、留白和标题层级，保留 ZeroWall 的产品内容、原始彩色标志和五项能力顺序。首屏主角是现有真实产品画面，主动作是下载；视频与功能导航为后续了解入口。

未购买或生成新图片。保留原有未提交的 9.0 功能与迁移文案，以及未跟踪的 weixing.jpg。群聊二维码已替换为用户本轮提供的原图与裁切图，没有把不存在的 app-workspace-v9.webp 标成新版截图。

## 视觉规范

| 用途 | 当前实现 |
| --- | --- |
| 页面 / 内容面板 | #F3F7F5 / #FFFFFF |
| 标题 / 辅助文字 | #183C35 / #607269 |
| 主操作 / 选中底 | #247263 / #DDEEE6 |
| 边框 | #D9E3DE |
| 英文标题 | Bricolage Grotesque，700–800 |
| 正文 | Inter，400–600；中文由 PingFang SC、Microsoft YaHei、Noto Sans SC 等回退 |
| 编号、参数、文件名 | JetBrains Mono |
| 按钮 | 青绿白字或白色细边框，12px 圆角，至少 44px 高 |
| 内容面板 | 约 20px 圆角、浅阴影 |

字体从本地 WOFF2 加载，三份 SIL OFL 授权、来源和 SHA-256 记录在 [font-manifest.json](font-manifest.json)。原始标志与 design/branding/zerowall-icon.png 保持字节一致。正文为 16–18px；小号标记和截图内容不承担必要的产品说明。

## 页面与关键状态

- 导航与首屏：精简密度，真实工具画面替代 WebGL 标志；版本和系统要求紧邻下载。手机按文字、下载、画面排序。首屏可放大查看原图，关闭恢复焦点。
- 视频：浅色画框，点击才加载；键盘可播放，离屏暂停，无脚本保留原生控件；失败给出重试与原视频入口。
- 五项能力：保留 Agent → 虚拟敲除 → 医学科研 → 文献复现 → 可编辑 PPTX 的顺序、锚点与历史。统一浅色工作区，分别保留网络对照、键盘医学页签、材料—执行—核查和 PPTX 对象选择。
- 工作流程：四个编号节点和随原生滚动推进的连接线，手机为竖线。移除重复的大幅工作台截图。
- 创意与收尾：既有作品画面为主，深松绿下载区明确主动作，社区采用白色二维码面板，页尾统一双语排版。
- 下载：保留现有元数据接口、共享请求、3 秒超时与构建地址回退。三个 CTA 均实际触发原生 EXE 下载，验证中取消下载，未安装软件。
- 社区：使用用户于 2026-11-15 提供的新群邀请，中英文标注有效至 2026-11-22；原图可放大与保存，二维码展示图保留白色静区。

## 动效与降级

按钮约 150ms 悬停/按下反馈，Motion JS 提供约 220ms 页签移动板、320ms 区块出场。流程线随原生滚动推进，不锁定页面、不接管滚轮。无脚本、减少动态效果与受限设备直接显示完整内容；增强加载失败不影响阅读。实时切换减少动态效果会清理指示动画与滚动绑定。

## 素材真实性

真实科研工具截图来自仓库既有 8.4.0 Host/离线插件采集，首屏、替代文本和预览明确标注 8.4.0。产品说明中的 9.0 与实时下载版本属于各自事实，未将旧图标为新版。ImageJ 画面仍准确说明为未加载数据的文件选择界面。既有 AI 插画与流程演示继续保留对应说明，不作为真实研究结果。

旧 WebGL 源文件、历史海报和历史字体资源保留，但当前首页不再引用和加载三维首屏。素材清单的原始生成参数用于追溯，不代表本轮新生成。

## 验证与证据

本地入口：http://127.0.0.1:4321/ 和 /en/ 。生产入口：https://zerowallscience.org/ 和 /en/ 。

| 检查 | 结果与记录 |
| --- | --- |
| TypeScript | pnpm check 通过 |
| 中英文 × 1440 / 1280 / 768 / 390 | 8 组布局通过，无横向溢出；verification/browser-report.json |
| 100% / 200% | 正常视口与 1440px 物理宽下 720px CSS 视口、DPR 2 的等效重排通过；标题、下载、PPTX 控件可见 |
| oil-ui 标准截图检查 | 中英文桌面与手机：无控制台错误、坏图、溢出或可读性提示；shots-final/report.json |
| 核心交互 | 锚点历史、移动菜单、医学键盘页签、PPTX 对象选择、预览与焦点返回通过 |
| 下载与降级 | 三个原生下载入口、元数据失败回退、无脚本、减少动态效果与受限设备通过 |
| 视频 | 8 组布局、桌面/手机实际播放 15.084 秒、原生控制、暂停、模拟 503 后重试通过；video/report.json |
| 收尾修正 | 中英文二维码有效状态、预览、焦点返回、页签停稳、流程线进度与字体/标志校验；final-states/report.json |

本轮按 oil-ui 运行了类型检查、生产构建、静态资源校验和相关浏览器验证，没有执行全量测试。verify-static.mjs 已在新构建上通过。

## 独立评审与边界

视觉独立评审为 **8/10**，原始结论与落实见 [VISUAL-REVIEW.md](../artifacts/pine-redesign/VISUAL-REVIEW.md)。已修正二维码有效状态和真实截图链接身份问题。剩余提升空间是五项能力的中段节奏与部分说明重复；未在修正后重新打分。

独立 UX 自主选择“判断单细胞虚拟敲除条件 → 查看准备要求 → 下载”路径，桌面与手机本地操作可完成，下载触发 9.1.4 安装包。外部官方文档在走查时连续返回 **502 Bad Gateway**，因此详细配置核对部分受阻；根因、持续时间和服务端修复不在本地视觉改版范围。见 [UX-REVIEW.md](../artifacts/pine-redesign/ux-review/UX-REVIEW.md)。

官方文档服务仍需单独确认恢复；本次未改文档服务、路由入口或新增业务 API。官网静态发布已完成，发布收据见 [production/after.json](../artifacts/production/after.json)。

## 前后画面

改版前基线：[桌面](../artifacts/afk-redesign/before/zerowall-before-desktop-plan.png)、[手机](../artifacts/afk-redesign/before/zerowall-before-mobile-plan.png)、[Agent](../artifacts/afk-redesign/before/zerowall-before-agent-plan.png)。

最终：[中文桌面首屏](../artifacts/pine-redesign/shots-final/page-1440x900.png)、[中文手机首屏](../artifacts/pine-redesign/shots-final/page-390x844.png)、[英文桌面首屏](../artifacts/pine-redesign/shots-final/en-1440x900.png)、[最终中文整页](../artifacts/pine-redesign/final-states/zh-1440-full.png)、[最终手机整页](../artifacts/pine-redesign/final-states/zh-390-full.png)。其他控件与动效状态位于 final-states/。
