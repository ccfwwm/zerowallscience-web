import { readFile, writeFile, access, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, join } from 'node:path';
import assert from 'node:assert/strict';
const root = resolve(import.meta.dirname, '..');
const manifest = JSON.parse(await readFile(join(root, 'design/manifest.json'), 'utf8'));
const originalBrand = await readFile(join(root, 'design/branding/zerowall-icon.png'));
const publicBrand = await readFile(join(root, 'public/assets/v2/zerowall-icon.png'));
const builtBrand = await readFile(join(root, 'dist/assets/v2/zerowall-icon.png'));
assert(originalBrand.equals(publicBrand) && originalBrand.equals(builtBrand), 'Supplied icon must be preserved byte for byte');
const originalBrandSha256 = createHash('sha256').update(originalBrand).digest('hex');
const fontManifest = JSON.parse(await readFile(join(root, 'design/font-manifest.json'), 'utf8'));
const fontBytes = await readFile(join(root, 'dist', fontManifest.file));
assert.equal(createHash('sha256').update(fontBytes).digest('hex'), fontManifest.sha256, 'Local Montserrat font hash');
await access(join(root, 'dist', fontManifest.licenseFile));
const pages = [];
for (const [language, file, canonical] of [['zh-CN','index.html','https://zerowallscience.org/'],['en','en/index.html','https://zerowallscience.org/en/']]) {
  const html = await readFile(join(root, 'dist', file), 'utf8');
  assert(html.includes(`<html lang="${language}">`));
  assert(html.includes(`rel="canonical" href="${canonical}"`));
  assert(html.includes('hreflang="zh-CN"') && html.includes('hreflang="en"'));
  assert(html.includes('/assets/v2/share-') && html.includes('property="og:image"'));
  assert(html.includes('rel="icon" type="image/png" sizes="512x512" href="/assets/v2/zerowall-icon.png"'));
  assert(!html.includes('brand.svg'), 'The substitute brand must not be referenced');
  let previous = -1;
  for (const id of ['agent','knockout','medical','reproduce','presentation','workflow','creative','download']) { const index = html.indexOf(`id="${id}"`); assert(index > previous, `${file}: ${id} order`); previous = index; }
  const imageTags = [...html.matchAll(/<img\b[^>]*>/g)].map(match => match[0]);
  const usages = [];
  for (const tag of imageTags) {
    const src = /\ssrc="([^"]+)"/.exec(tag)?.[1]; if (!src) continue;
    assert(src.startsWith('/assets/v2/'), `Legacy visible image: ${src}`);
    await access(join(root, 'dist', src));
    const alt = /\salt="([^"]*)"/.exec(tag)?.[1]; assert.notEqual(alt, undefined);
    usages.push({ path: src, alt, language, page: `/${file === 'index.html' ? '' : 'en/'}` });
  }
  const native = [...html.matchAll(/<a\b[^>]*data-latest-windows-download[^>]*>/g)].map(match => match[0]);
  assert.equal(native.length, 3);
  native.forEach(tag => assert(/href="https:\/\/zerowall\.chengxunkeji\.cn\/[^"\s]+\.exe"/.test(tag), 'Native EXE URL must be in build output'));
  for (const item of manifest.assets) item.usages = [...(item.usages || []).filter(use => use.language !== language), ...usages.filter(use => use.path === item.path)];
  pages.push({ file, language, canonical, nativeDownloads: native.length, visibleImages: usages.length, legacyReferences: 0 });
}
for (const item of manifest.assets) {
  const bytes = await readFile(join(root, 'public', item.path));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), item.sha256, item.path);
}
const redirect = await readFile(join(root, 'dist/zh/index.html'), 'utf8'); assert(redirect.includes('url=/'));
manifest.inlineVisuals = [
  { purpose: 'Knockout network comparison', format: 'SVG', source: 'Original illustrative topology, no scientific data', language: 'zh/en' },
  { purpose: 'Research steps, medical study inputs, paper reproduction, PPTX objects and media timeline', format: 'HTML/CSS', source: 'Original bilingual workflow demonstrations', language: 'zh/en' },
  { purpose: 'Brand scene', format: 'WebGL', source: 'User supplied original ZeroWall icon texture, cyan and violet orbital accents; static original-icon composition fallback', sourceSha256: originalBrandSha256, language: 'neutral' }
];
await writeFile(join(root, 'design/manifest.json'), JSON.stringify(manifest, null, 2));
await mkdir(join(root, 'artifacts/verification'), { recursive: true });
await writeFile(join(root, 'artifacts/verification/static-report.json'), JSON.stringify({ checkedAt: new Date().toISOString(), pages, assets: manifest.assets.length, hashesVerified: true, originalBrandPreserved: true, originalBrandSha256, legacyRedirect: true, passed: true }, null, 2));
console.log(JSON.stringify({ pages: pages.length, assets: manifest.assets.length, legacyReferences: 0, passed: true }));
