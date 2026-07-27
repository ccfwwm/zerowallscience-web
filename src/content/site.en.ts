// English site content
export const en = {
  meta: {
    title: 'ZeroWall Science — Science Without Walls',
    description: 'Local-first, model-agnostic AI research workbench for macOS, Windows & Linux.',
  },
  nav: {
    features: 'Features',
    architecture: 'Architecture',
    capabilities: 'Capabilities',
    download: 'Download',
  },
  hero: {
    title: 'Science Without Walls',
    sub: 'Local-first, model-agnostic AI research workbench. Run the entire research loop — from exploration to publication — in one auditable desktop session.',
    cta: '⬇ Download Now',
    stats: [
      { value: '7', label: 'Languages' },
      { value: '3', label: 'Platforms' },
      { value: 'v0.3.4', label: 'Latest' },
    ],
  },
  loop: {
    tag: 'Research Loop',
    title: 'From Idea to Paper, Autonomously',
    sub: 'One meta-skill drives four stages — each produces real, inspectable artifacts, not just chat replies.',
    steps: [
      { title: 'Explore', desc: 'Turn a broad research direction into concrete topics, hypotheses, and a pre-survey.' },
      { title: 'Survey', desc: 'Produce a 6–20 page PDF literature review with 60+ real, verified citations.' },
      { title: 'Experiment', desc: 'Design docs, runnable code, results with provenance, figures, and analysis reports.' },
      { title: 'Write', desc: '8–14 page research paper, 200+ citations, 4–8 figures — publication-grade output.' },
    ],
  },
  features: {
    tag: 'Core Features',
    title: 'Built for Real Research',
    sub: 'Every feature designed to accelerate scientific work while keeping you in full control.',
    items: [
      { icon: '🤖', title: 'Autonomous Research Agents', desc: 'The bundled ai4s-agent chains specialist skills end to end — explore, survey, experiment, write — producing inspectable artifacts at every stage.' },
      { icon: '🔗', title: 'Full Provenance Tracking', desc: 'Every figure, table, and report links back to the exact code, inputs, environment, model output, and conversation that produced it.' },
      { icon: '🏠', title: 'Local-First Architecture', desc: 'Sessions, data, provenance, notebooks, and run records live in local folders on your machine. Nothing leaves by default.' },
      { icon: '🔌', title: 'Model-Agnostic Runtime', desc: 'Bring your own model. The runtime talks through a clean SDK layer — providers, skills, and MCP servers stay pluggable.' },
      { icon: '🔬', title: 'Reproducible Runs', desc: 'Local, SSH/Slurm, Modal, and notebook-batch runs are captured as reproducible run records with full environment snapshots.' },
      { icon: '📱', title: 'Access from Anywhere', desc: 'A token-authenticated gateway serves the real UI to your phone or LAN browser. Start a run at your desk, check results on the go.' },
      { icon: '🌐', title: 'Browser Control', desc: 'Drive your own Chrome — profile and logins intact — to read the live web the way you do, or an isolated private browser on demand.' },
      { icon: '🧩', title: 'Highly Extensible', desc: 'Agent skills, MCP servers, one-click science connectors (arXiv, PubMed, Crossref, Materials Project…), slash commands, and shell mode.' },
    ],
  },
  capabilities: {
    tag: 'Capabilities',
    title: 'Powerful Research Toolkit',
    sub: 'A comprehensive platform that covers the entire scientific workflow.',
    items: [
      { title: 'Multi-Session Workspace', desc: 'Run multiple research sessions simultaneously with isolated workspaces, shared file system, and full history.' },
      { title: 'Integrated Notebooks', desc: 'Real .ipynb files with Python and R kernel execution, managed Jupyter environment, and seamless agent integration.' },
      { title: 'Rich Viewers', desc: 'PDF, images, video, HTML, Markdown, CSV/TSV tables with charts, molecules, 3D meshes, genome tracks, and more.' },
      { title: 'Literature Connectors', desc: 'One-click access to arXiv, PubMed, Crossref, Semantic Scholar, bioRxiv/medRxiv, and more research databases.' },
      { title: 'Integrity Auditing', desc: 'Built-in auditor checks images, numbers, logic, and citations with 4-level evidence grading before publication.' },
      { title: 'Safety by Default', desc: 'Command execution, file deletion, dependency install, and remote connections all require explicit human approval.' },
    ],
  },
  architecture: {
    tag: 'Architecture',
    title: 'Clean Layered Design',
    sub: 'Decoupled layers with a strict SDK boundary — the UI never calls the agent runtime directly.',
    layers: [
      { icon: '🖥️', name: 'Desktop UI (Tauri + React)', desc: 'Multi-session chat, file browser, notebooks, run viewer, provenance inspector' },
      { icon: '📦', name: 'OpenCodeClient SDK', desc: 'Type-safe wrapper — the only path between UI and runtime' },
      { icon: '⚙️', name: 'OpenCode Sidecar', desc: 'Bundled, pinned, auto-started — isolated from user\'s own config' },
      { icon: '🔒', name: 'Local Workspace', desc: 'SQLite + JSONL provenance + OS keychain — keys never in logs, exports, or git' },
    ],
    dividers: ['SDK Contract', 'Process Boundary', 'Security Boundary'],
  },
  download: {
    tag: 'Download',
    title: 'Get ZeroWall Science',
    sub: 'Free, open-source, available for all major platforms.',
    platforms: [
      { icon: '🍎', name: 'macOS', note: 'Apple Silicon & Intel, macOS 13+', status: 'coming', statusLabel: 'Coming Soon' },
      { icon: '🪟', name: 'Windows', note: 'Windows 10/11 x64. SmartScreen: More info → Run anyway.', status: 'available', statusLabel: 'Download .exe' },
      { icon: '🐧', name: 'Linux', note: 'x86_64 .deb / .rpm', status: 'coming', statusLabel: 'Coming Soon' },
    ],
  },
  footer: {
    tagline: 'Science Without Walls.',
    copyright: '© 2026 ZeroWall Science',
  },
} as const;
