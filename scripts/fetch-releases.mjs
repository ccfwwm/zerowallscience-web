/**
 * Fetch the latest release info from GitHub and write src/data/releases.json.
 * Runs at build time — the site ships a static snapshot.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

const REPO = 'ccfwwm/zerowallscience-releases';
const API = `https://api.github.com/repos/${REPO}/releases?per_page=5`;

async function main() {
  const res = await fetch(API, {
    headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'zerowallscience-web' },
  });
  if (!res.ok) {
    console.warn(`⚠️  GitHub API returned ${res.status} — using fallback data`);
    writeFallback();
    return;
  }
  const releases = await res.json();
  const data = releases
    .filter((r) => !r.draft)
    .map((r) => ({
      tag: r.tag_name,
      name: r.name || r.tag_name,
      published: r.published_at,
      url: r.html_url,
      assets: r.assets.map((a) => ({
        name: a.name,
        size: a.size,
        url: a.browser_download_url,
      })),
    }));
  writeData(data);
}

function writeFallback() {
  writeData([
    {
      tag: 'v0.3.4',
      name: 'v0.3.4',
      published: '2026-07-27T11:32:32Z',
      url: `https://github.com/${REPO}/releases/tag/v0.3.4`,
      assets: [{ name: 'ZeroWall.Science_0.3.4_x64-setup.exe', size: 0, url: `https://github.com/${REPO}/releases/download/v0.3.4/ZeroWall.Science_0.3.4_x64-setup.exe` }],
    },
  ]);
}

function writeData(data) {
  const outPath = resolve(import.meta.dirname, '../src/data/releases.json');
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(data, null, 2));
  console.log(`✅ releases.json written — ${data.length} release(s), latest: ${data[0]?.tag}`);
}

main().catch((err) => {
  console.error(err);
  writeFallback();
});
