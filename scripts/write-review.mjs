import { readFile, writeFile, access } from 'node:fs/promises';
import { resolve, join } from 'node:path';
const root = resolve(import.meta.dirname, '..');
const read = name => readFile(join(root, name), 'utf8').then(JSON.parse);
const browser = await read('artifacts/verification/browser-report.json');
const staticReport = await read('artifacts/verification/static-report.json');
const download = await read('artifacts/download-verification/receipt.json');
const ppt = await read('design/pptx-verification.json');
const manifest = await read('design/manifest.json');
const community = await read('artifacts/verification/community-report.json').catch(() => null);
if (!browser.passed || !staticReport.passed || !download.verified || !ppt.verified) throw new Error('Verification must pass before publishing the review');
const labels = { hero:'首屏与品牌装置', agent:'科研 Agent', knockout:'虚拟基因敲除', medical:'医疗科研', reproduce:'文献复现', presentation:'可编辑 PPTX' };
const cards = Object.entries(labels).flatMap(([id,label]) => [1440,390].map(width => `<article data-size="${width}"><a href="../artifacts/verification/zh-${width}-${id}.png"><img loading="lazy" src="../artifacts/verification/zh-${width}-${id}.png" alt="${label}，${width}px 浏览器截图"/></a><p>${label}<span>${width}px</span></p></article>`));
const extra = [['medical-clinical-tab.png','临床与公共健康场景'],['medical-imaging-tab.png','科研影像场景'],['editable-object-selection.png','PPTX 对象选中状态'],['mobile-editable-objects.png','手机端 PPTX 对象'],['zh-1440-creative.png','图片、视频与音乐'],['zh-1440-full-static.png','桌面完整静态布局'],['zh-390-full-static.png','手机完整页面']].map(([file,label]) => `<article data-size="extra"><a href="../artifacts/verification/${file}"><img loading="lazy" src="../artifacts/verification/${file}" alt="${label}"/></a><p>${label}</p></article>`);
const html = `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ZeroWall Science · 本地改版验收</title><style>*{box-sizing:border-box}body{margin:0;background:#090d14;color:#e7f0f6;font:15px/1.7 'Segoe UI','Microsoft YaHei',sans-serif}main{max-width:1440px;margin:auto;padding:60px 28px}header{margin-bottom:40px}header img{width:40px;height:40px}h1{font-size:34px;font-weight:550}header p{color:#8ca2b2;max-width:800px}a{color:#00d4ff;text-decoration:none}nav{display:flex;flex-wrap:wrap;gap:12px;margin:25px 0}button{font:inherit;color:#bcd3df;border:1px solid #294554;border-radius:6px;background:#101b28;padding:8px 18px;cursor:pointer}button[aria-pressed=true]{color:#00171f;background:#00d4ff}section{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px}article{margin:0;background:#101722;border:1px solid #25323e;border-radius:8px;overflow:hidden}article img{width:100%;max-height:500px;object-fit:contain;object-position:top;display:block;background:#060a10}article p{margin:0;padding:16px 20px}article span{float:right;color:#6e8c9d;font-size:12px}[hidden]{display:none!important}:focus-visible{outline:2px solid #00d4ff;outline-offset:4px}footer{margin-top:40px;color:#8ca2b2}@media(max-width:700px){section{grid-template-columns:1fr}h1{font-size:27px}}</style><main><header><img src="../public/assets/v2/zerowall-icon.png" alt="ZeroWall 标志"><h1>ZeroWall Science 官网改版</h1><p>五项科研能力、全新素材与双语响应式页面。以下为生产构建的真实浏览器截图；点击图片可查看原尺寸。</p><p><a href="${browser.base}/">打开中文预览</a>　<a href="${browser.base}/en/">English preview</a>　<a href="IMPLEMENTATION-REPORT.md">验收记录</a>　<a href="manifest.json">素材清单</a>　<a href="../public/samples/zerowall-editable-research.pptx">可编辑 PPTX 示例</a></p><p>通过：8 组尺寸与语言检查 · 3 个 EXE 直接下载入口 · 安装包完整哈希校验 · 3 页 PPTX 原生对象检查</p></header><nav aria-label="筛选截图"><button data-filter="all" aria-pressed="true">全部</button><button data-filter="1440" aria-pressed="false">桌面</button><button data-filter="390" aria-pressed="false">手机</button><button data-filter="extra" aria-pressed="false">细节与全页</button></nav><section>${cards.join('')}${extra.join('')}</section><footer>本地交付 · 检查时间 ${browser.checkedAt} · 图片和网络图中的演示内容已标识用途。</footer></main><script>document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-filter]').forEach(n=>n.setAttribute('aria-pressed',String(n===button)));document.querySelectorAll('[data-size]').forEach(n=>n.hidden=button.dataset.filter!=='all'&&n.dataset.size!==button.dataset.filter)}));</script></html>`;
await writeFile(join(root, 'design/review.html'), html);
for (const match of html.matchAll(/(?:src|href)="(\.\.\/[^\"]+)"/g)) await access(resolve(root, 'design', match[1]));
const report = `# ZeroWall Science 官网改版验收

本地实现与验证已完成。预览地址：${browser.base}/；英文：${browser.base}/en/。

## 实现内容

首页依次展示科研 Agent、虚拟基因敲除、医疗科研、文献复现、可编辑 PPTX，之后展示科研工作流和图片、视频、音乐创作。至少 1200 × 780px 的桌面使用七屏固定舞台，较窄、较矮屏幕和减少动画模式使用纵向布局。功能章节左右交错，标题使用字重 700，主文案 16–19px；面板步骤至少 14px。中文沿用参考站的黑体字体栈，品牌和数字使用本地 Montserrat 可变字体。测量和字号对照见 TYPOGRAPHY-REVIEW.md，字体来源、授权与哈希见 font-manifest.json。首屏三维装置延迟加载，离屏和后台暂停；WebGL 不可用时保留静态海报。

中英文共用组件和内容类型，中文为根路径、英文为 /en/，旧 /zh/ 保留跳转。导航、页尾、下载区标志和完整尺寸 favicon 使用用户提供的原始 ZeroWall 图标，文件字节完全一致；小尺寸 favicon 仅作缩放。首屏以原图标中的渐变 0、白色 Z 和紫色碎片为主体，加入悬浮、轨道与光晕，桌面动画和手机静态海报沿用同一图标。四类插画、真实产品截图和分享封面使用新素材。已移除首页旧架构与展示组件。

## 检查结果

| 项目 | 结果 |
| --- | --- |
| 单元测试 | 6 项通过，覆盖元数据校验、共享请求、超时及失败回退 |
| TypeScript | pnpm check 通过 |
| 生产构建 | pnpm build 通过 |
| 页面与图片 | 中英文元数据、核心内容顺序及旧 /zh/ 跳转通过；${manifest.assets.length} 个素材哈希通过；旧展示素材引用 0 |
| 浏览器布局 | ${browser.layouts.length} 组：中英文 × 1440、1280、768、390px；无横向溢出 |
| 正常页面错误 | 新增控制台及页面错误 ${browser.errors.length} |
| 字体可读性 | ${browser.typography?.length || 0} 组字号、字重、本地字体加载检查；固定舞台检查标题和窗口不覆盖导航及章节控件 |
| 原生下载 | 导航、首屏、页尾 ${browser.downloads.length} 个入口触发 EXE 下载，官网地址保持 |
| 回退与交互 | 无脚本、减少动画、WebGL 不可用、低性能、元数据不可用；菜单、键盘页签、历史返回、锚点、对象选择及弹窗焦点通过 |
| PPTX | 3 页实际导出，原生形状 5 / 13 / 4，独立图片 1，原生表格 1，原生图表 1；软件回读与逐页渲染检查通过 |

## 完整安装包校验

- 版本：${download.version}
- 地址：${download.url}
- 字节数：${download.bytes}
- SHA-256：${download.sha256}
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

构建对延迟加载的三维代码块给出大小提示：约 538 kB，gzip 约 135 kB；手机与静态回退页面不会启动该三维场景。核心页面脚本约 9 kB，gzip 约 3.6 kB。

本次为本地交付。生产环境和原有部署流程未执行，预览服务保持在 127.0.0.1:4323。
`;
const communitySummary = community?.passed ? `
## 用户交流群（2026-10-19）

下载区之后、页尾之前新增中英文微信群区域，页尾提供进群锚点。桌面图文并排，手机纵向展示。二维码使用用户原图的无损裁切，放大和保存提供字节一致的原图，页面明确标注 2026 年 10 月 26 日前有效。

本次增量验证：TypeScript、生产构建、静态资源检查通过；中英文 × 1440、1280、768、390px 共 ${community.layouts.length} 组布局无横向溢出；${community.dialogs.length} 组弹窗键盘打开、Escape 关闭、焦点恢复和视口检查通过；${community.downloads.length} 次原图保存与源文件哈希一致；无脚本回退通过；新增控制台与页面错误 ${community.errors.length}。未加入微信群或发送消息。

设计说明与维护方式见 [COMMUNITY-REVIEW.md](COMMUNITY-REVIEW.md)，证据见 artifacts/verification/community-report.json。本次不重复执行安装包与 PPTX 校验，前文对应检查属于此前改版记录。
` : '';
await writeFile(join(root, 'design/IMPLEMENTATION-REPORT.md'), report + communitySummary);
console.log('Review gallery and implementation report written.');
