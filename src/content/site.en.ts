// English site content
export const en = {
  meta: {
    title: 'ZeroWall Science — Science Without Walls',
    description: 'Local-first, model-agnostic AI research workbench for macOS, Windows & Linux.',
  },
  nav: {
    features: 'Features',
    architecture: 'Architecture',
    showcase: 'Showcase',
    download: 'Download',
  },
  hero: {
    badge: '#1 on ResearchClawBench',
    title: 'Science Without Walls',
    sub: 'Local-first, model-agnostic AI research workbench. Run the entire research loop — from exploration to publication — in one auditable desktop session.',
    cta: '⬇ Download Free',
    stats: [
      { value: '7', label: 'Languages' },
      { value: '3', label: 'Platforms' },
      { value: 'MIT', label: 'License' },
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
    tag: 'Key Features',
    title: 'Built for Real Research',
    sub: 'Every feature designed to accelerate scientific work while keeping you in control.',
    items: [
      { icon: '🤖', title: 'Autonomous Agents', desc: 'The bundled ai4s-agent chains specialist skills end to end — explore, survey, experiment, write — producing inspectable artifacts at every stage.' },
      { icon: '🔗', title: 'Full Provenance', desc: 'Every figure, table, and report links back to the exact code, inputs, environment, model output, and conversation that produced it.' },
      { icon: '🏠', title: 'Local-First', desc: 'Sessions, data, provenance, notebooks, and run records live in local folders on your machine. Nothing leaves by default.' },
      { icon: '🔌', title: 'Model-Agnostic', desc: 'Bring your own model. The runtime talks through a clean SDK layer — providers, skills, and MCP servers stay pluggable.' },
      { icon: '🔬', title: 'Reproducible Runs', desc: 'Local, SSH/Slurm, Modal, and notebook-batch runs are captured as reproducible run records, not loose terminal scrollback.' },
      { icon: '📱', title: 'Access Anywhere', desc: 'A token-authenticated gateway serves the real UI to your phone or LAN browser. Start a run at your desk, check it on your phone.' },
      { icon: '🌐', title: 'Browser Control', desc: 'Drive your own Chrome — profile and logins intact — to read the live web the way you do, or an isolated private browser on demand.' },
      { icon: '🧩', title: 'Extensible', desc: 'Agent skills, MCP servers, one-click science connectors (arXiv, PubMed, Crossref, Materials Project…), slash commands, and shell mode.' },
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
  showcase: {
    tag: 'In Action',
    title: 'See It Work',
    items: [
      { img: '/assets/showcase-provenance.webp', caption: 'One prompt → a publication-grade figure, every point traces to its generating code.' },
      { img: '/assets/showcase-literature.webp', caption: 'Literature → verifiable report, with citation review confirming every DOI resolves.' },
      { img: '/assets/showcase-browser.webp', caption: 'Drives your own Chrome to harvest data into charts and CSVs.' },
      { img: '/assets/showcase-remote.webp', caption: 'Reproducible remote runs on SSH/Slurm/Modal with full provenance.' },
    ],
  },
  download: {
    tag: 'Download',
    title: 'Get ZeroWall Science',
    sub: 'Free, open-source, MIT licensed. Available for all major platforms.',
    platforms: [
      { icon: '🍎', name: 'macOS', note: 'Apple Silicon & Intel, macOS 13+. Run xattr -cr if Gatekeeper blocks.' },
      { icon: '🪟', name: 'Windows', note: 'Windows 10/11 x64. SmartScreen: More info → Run anyway.' },
      { icon: '🐧', name: 'Linux', note: 'x86_64. sudo apt install ./…_amd64.deb' },
    ],
    source: 'Or build from source:',
    sourceCmd: 'git clone https://github.com/ccfwwm/zerowallscience && pnpm install && pnpm build',
  },
  footer: {
    license: 'MIT License',
    tagline: 'Science Without Walls.',
  },
} as const;
