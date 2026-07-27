// 中文站点内容
export const zh = {
  meta: {
    title: 'ZeroWall Science — 科学，无界',
    description: '本地优先、模型无关的 AI 科研工作台，支持 macOS、Windows 和 Linux。',
  },
  nav: {
    features: '功能特色',
    architecture: '技术架构',
    showcase: '效果展示',
    download: '下载',
  },
  hero: {
    badge: '🏆 ResearchClawBench 排行榜 #1',
    title: '科学，无界',
    sub: '本地优先、模型无关的 AI 科研工作台。在一个可审计的桌面会话中，完成从探索到论文发表的全研究闭环。',
    cta: '⬇ 免费下载',
    stats: [
      { value: '7', label: '界面语言' },
      { value: '3', label: '支持平台' },
      { value: 'MIT', label: '开源协议' },
      { value: 'v0.3.4', label: '最新版本' },
    ],
  },
  loop: {
    tag: '研究闭环',
    title: '从灵感到论文，全自动',
    sub: '一个元技能驱动四个阶段 — 每个阶段产出真实、可检查的研究产物，而非对话文本。',
    steps: [
      { title: '探索', desc: '将宽泛的研究方向细化为具体课题、假设和前期文献调查。' },
      { title: '综述', desc: '生成 6–20 页 PDF 文献综述，含 60+ 真实、已验证的引用。' },
      { title: '实验', desc: '设计文档、可执行代码、带溯源的结果、图表和分析报告。' },
      { title: '写作', desc: '8–14 页研究论文，200+ 引用，4–8 张图表 — 出版级质量。' },
    ],
  },
  features: {
    tag: '核心特色',
    title: '为真实科研而生',
    sub: '每个功能都为加速科学工作而设计，同时让你保持完全掌控。',
    items: [
      { icon: '🤖', title: '自主研究 Agent', desc: '内置 ai4s-agent 串联专业技能端到端运行 — 探索、综述、实验、写作 — 每一步都产出可检查的研究产物。' },
      { icon: '🔗', title: '全链路溯源', desc: '每个图表和报告都追溯到生成它的精确代码、输入数据、运行环境、模型输出和对话记录。' },
      { icon: '🏠', title: '本地优先', desc: '会话、数据、溯源、笔记本和运行记录全部存储在本地文件夹。默认不向外发送任何数据。' },
      { icon: '🔌', title: '模型无关', desc: '使用你自己的模型。运行时通过干净的 SDK 层通信 — 供应商、技能和 MCP 服务器完全可插拔。' },
      { icon: '🔬', title: '可复现运行', desc: '本地、SSH/Slurm、Modal 和批量笔记本运行被记录为可复现的运行记录，而非松散的终端日志。' },
      { icon: '📱', title: '随时随地访问', desc: '令牌认证网关将真实 UI 推送到手机或局域网浏览器。在电脑前启动任务，路上用手机查看结果。' },
      { icon: '🌐', title: '浏览器控制', desc: '驱动你自己的 Chrome — 保留你的登录状态 — 像你一样阅读网页；或按需启动隔离的隐私浏览器。' },
      { icon: '🧩', title: '高度可扩展', desc: 'Agent 技能、MCP 服务器、一键科学连接器（arXiv、PubMed、Crossref、Materials Project…）、斜杠命令和 Shell 模式。' },
    ],
  },
  architecture: {
    tag: '技术架构',
    title: '清晰分层设计',
    sub: '解耦层与严格 SDK 边界 — UI 永远不直接调用 Agent 运行时。',
    layers: [
      { icon: '🖥️', name: '桌面 UI (Tauri + React)', desc: '多会话聊天、文件浏览器、笔记本、运行查看器、溯源检查器' },
      { icon: '📦', name: 'OpenCodeClient SDK', desc: '类型安全封装 — UI 与运行时间唯一通信路径' },
      { icon: '⚙️', name: 'OpenCode Sidecar', desc: '捆绑、版本锁定、自动启动 — 与用户自有配置隔离' },
      { icon: '🔒', name: '本地工作区', desc: 'SQLite + JSONL 溯源 + 系统钥匙串 — 密钥永不出现在日志、导出或 git 中' },
    ],
    dividers: ['SDK 契约', '进程边界', '安全边界'],
  },
  showcase: {
    tag: '实际效果',
    title: '看看它的实力',
    items: [
      { img: '/assets/showcase-provenance.webp', caption: '一条提示 → 出版级图表，每个数据点都追溯到生成代码。' },
      { img: '/assets/showcase-literature.webp', caption: '文献 → 可验证报告，引用审查确认每个 DOI 可解析。' },
      { img: '/assets/showcase-browser.webp', caption: '驱动你的 Chrome 将数据转化为图表和 CSV。' },
      { img: '/assets/showcase-remote.webp', caption: '在 SSH/Slurm/Modal 上进行可复现的远程运行，含完整溯源。' },
    ],
  },
  download: {
    tag: '下载',
    title: '获取 ZeroWall Science',
    sub: '免费、开源、MIT 许可。支持所有主流平台。',
    platforms: [
      { icon: '🍎', name: 'macOS', note: 'Apple Silicon 和 Intel，macOS 13+。如 Gatekeeper 拦截请执行 xattr -cr。' },
      { icon: '🪟', name: 'Windows', note: 'Windows 10/11 x64。SmartScreen 弹窗点击"更多信息 → 仍要运行"。' },
      { icon: '🐧', name: 'Linux', note: 'x86_64。sudo apt install ./…_amd64.deb' },
    ],
    source: '或从源码构建：',
    sourceCmd: 'git clone https://github.com/ccfwwm/zerowallscience && pnpm install && pnpm build',
  },
  footer: {
    license: 'MIT 许可证',
    tagline: '科学，无界。',
  },
} as const;
