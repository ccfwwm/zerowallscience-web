# ZeroWall Science 官网设计

当前设计以 [松柏青改版说明](PINE-REDESIGN.md) 为准，取代旧版深海蓝、青紫发光与 Montserrat 的视觉约定。

设计北极星：像走进明亮的科研工作台，先看懂产品，再下载开始。背景采用灰白、内容面采用白色，深松绿建立标题层级，青绿与薄荷绿用于操作和选中状态。英文标题使用 Bricolage Grotesque，正文使用 Inter，编号、参数和文件名使用 JetBrains Mono；三套字体均本地托管，来源、哈希和 OFL 授权见 [字体清单](font-manifest.json)。

保留原始彩色 ZeroWall 标志。导航、页尾和完整尺寸 favicon 的图标与 branding/zerowall-icon.png 字节一致。首屏采用现有真实科研工具界面，明确标注截图版本 8.4.0；下载版本从现有元数据接口获取，和截图版本分别说明。首屏不再加载三维标志、轨道或粒子。

中英文共用 Astro 组件。科研 Agent、虚拟敲除、医学科研、文献复现和可编辑 PPTX 保留顺序与锚点，桌面左右交错、手机纵向展开。流程示意、真实截图、既有 AI 插画保持各自的事实说明。本轮复用素材，没有购买或生成图片。

动效使用 Motion JS：约 320ms 区块出场、220ms 页签指示与原生滚动推进的四步连接线；按钮使用约 150ms 反馈。无脚本、减少动态效果及受限设备直接显示完整内容。

图片来源、处理方式、有效期、尺寸和哈希见 [素材清单](manifest.json)。社群二维码已替换为 2026-11-15 提供的新邀请，当前页面标注有效至 2026-11-22。本地过程证据位于 artifacts/pine-redesign/，改版前基线在 artifacts/afk-redesign/before/。

旧版 TYPOGRAPHY-REVIEW.md、VIDEO-SCROLL-REVIEW.md、COMMUNITY-REVIEW.md 与 review.html 保留为历史记录，不作为当前色板、字体、二维码有效性或截图版本的依据。本次发布记录另见 artifacts/production/。
