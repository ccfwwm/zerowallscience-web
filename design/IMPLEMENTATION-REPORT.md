# ZeroWall Science 官网改版验收

本地实现与验证已完成。预览地址：http://127.0.0.1:4323/；英文：http://127.0.0.1:4323/en/。

## 实现内容

首页依次展示科研 Agent、虚拟基因敲除、医疗科研、文献复现、可编辑 PPTX，之后展示科研工作流和图片、视频、音乐创作。所有尺寸使用自然连续章节，桌面左右交错、手机纵向布局，原生锚点和历史导航不接管滚轮。首屏之后提供用户宣传片，点击后才加载 MP4，离屏或后台暂停；播放器保留原生全屏、声音和进度控件。功能章节左右交错，标题使用字重 700，主文案 16–19px；面板步骤至少 14px。中文沿用参考站的黑体字体栈，品牌和数字使用本地 Montserrat 可变字体。测量和字号对照见 TYPOGRAPHY-REVIEW.md，字体来源、授权与哈希见 font-manifest.json。首屏三维装置延迟加载，上限 30 fps，离屏和后台暂停；WebGL 不可用时保留静态海报。

中英文共用组件和内容类型，中文为根路径、英文为 /en/，旧 /zh/ 保留跳转。导航、页尾、下载区标志和完整尺寸 favicon 使用用户提供的原始 ZeroWall 图标，文件字节完全一致；小尺寸 favicon 仅作缩放。首屏以原图标中的渐变 0、白色 Z 和紫色碎片为主体，加入悬浮、轨道与光晕，桌面动画和手机静态海报沿用同一图标。四类插画、真实产品截图和分享封面使用新素材。已移除首页旧架构与展示组件。

## 检查结果

| 项目 | 结果 |
| --- | --- |
| 单元测试 | 6 项通过，覆盖元数据校验、共享请求、超时及失败回退 |
| TypeScript | pnpm check 通过 |
| 生产构建 | pnpm build 通过 |
| 页面与图片 | 中英文元数据、核心内容顺序及旧 /zh/ 跳转通过；18 个素材哈希通过；旧展示素材引用 0 |
| 浏览器布局 | 8 组：中英文 × 1440、1280、768、390px；无横向溢出 |
| 正常页面错误 | 新增控制台及页面错误 0 |
| 字体可读性 | 8 组字号、字重、本地字体加载检查；连续章节检查无重叠且原生锚点可达 |
| 原生下载 | 导航、首屏、页尾 3 个入口触发 EXE 下载，官网地址保持 |
| 回退与交互 | 无脚本、减少动画、WebGL 不可用、低性能、元数据不可用；菜单、键盘页签、历史返回、锚点、对象选择及弹窗焦点通过 |
| PPTX | 3 页实际导出，原生形状 5 / 13 / 4，独立图片 1，原生表格 1，原生图表 1；软件回读与逐页渲染检查通过 |

## 完整安装包校验

- 版本：8.4.2
- 地址：https://zerowall.chengxunkeji.cn/stable/releases/8.4.2/zerowall-science-8.4.2-win-x64.exe
- 字节数：289201848
- SHA-256：b1d43899ba686756cfba291c9c0265fa46563e9600ab953d7a3cb37711646d5a
- 完整文件保存在 artifacts/download-verification/，已与官方元数据匹配。

## 素材与样例

设计和截图总览见 [review.html](review.html)，素材明细见 [manifest.json](manifest.json)。辅助视觉按 gpt-image-2.5-sunburst、quality=high、1536×1024 生成，源图与网页图的哈希分别记录。中文标题、流程和按钮由代码排版。

真实截图使用 8.4.0 发布 Host 与离线插件，在 Node 和独立空白配置中运行后采集；没有读取现有科研项目。影像图为 ImageJ 文件选择界面，未展示一次实际医学分析。网络、复现图和演示柱图属于流程示意。

可编辑样例由软件 dsh-ppt-maker 导出引擎创建，文件为 public/samples/zerowall-editable-research.pptx。页面包含独立文字、形状、图片和原生表格、图表，没有整页图片替代。数值 44、75、58、90 标明为演示数据。渲染使用 LibreOffice Impress → PDF → MuPDF；回读使用软件 loadReverseModel 及 OOXML 检查。本次未以 PowerPoint 原生客户端验证。

## 文件位置

- artifacts/verification/browser-report.json：浏览器检查与截图。
- artifacts/verification/static-report.json：路由、元数据、素材哈希检查。
- artifacts/download-verification/receipt.json：完整下载收据。
- design/pptx-export-receipt.json、pptx-verification.json、pptx-readback.json：导出与回读证据。
- artifacts/pptx-render/：三页 PDF 和逐页 PNG。

构建对延迟加载的三维代码块给出大小提示：约 538 kB，gzip 约 135 kB；手机与静态回退页面不会启动该三维场景。核心页面脚本约 9 kB，gzip 约 3.5 kB。

预览服务位于 127.0.0.1:4323。生产发布记录独立保存在 artifacts/production/ 和 artifacts/production-video/；不覆盖之前的发布证据。

## 用户交流群（2026-10-19）

下载区之后、页尾之前新增中英文微信群区域，页尾提供进群锚点。桌面图文并排，手机纵向展示。二维码使用用户原图的无损裁切，放大和保存提供字节一致的原图，页面明确标注 2026 年 10 月 26 日前有效。

本次增量验证：TypeScript、生产构建、静态资源检查通过；中英文 × 1440、1280、768、390px 共 8 组布局无横向溢出；4 组弹窗键盘打开、Escape 关闭、焦点恢复和视口检查通过；4 次原图保存与源文件哈希一致；无脚本回退通过；新增控制台与页面错误 0。未加入微信群或发送消息。

设计说明与维护方式见 [COMMUNITY-REVIEW.md](COMMUNITY-REVIEW.md)，证据见 artifacts/verification/community-report.json。本次不重复执行安装包与 PPTX 校验，前文对应检查属于此前改版记录。

## 宣传片与连续滚动（2026-10-19）

首屏之后嵌入用户原视频，16:9 构图，点击后才加载并播放。保留声音、进度和全屏控件，离屏和后台暂停；错误时可重试或打开原视频。移除视频下方的小字及公开页面的 PPTX 示例下载入口，保留对象演示。

中英文 × 四种宽度共 8 组检查通过；桌面和手机实际播放、定位到 8 秒、键盘焦点转移、离屏暂停、返回不自动播放通过；无脚本控件和视频源失败后重试恢复通过。正常页面新增错误 0。证据见 artifacts/video-scroll/report.json，设计说明见 VIDEO-SCROLL-REVIEW.md。
