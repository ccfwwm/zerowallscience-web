import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchLatestRelease } from '../../src/lib/latest-release.mjs';
const metadata = { version: '8.4.0', assetUrl: 'https://zerowall.chengxunkeji.cn/stable/releases/8.4.0/app.exe', assetName: 'app.exe', assetSha256: '7'.repeat(64), sizeBytes: 289188026, publishedAt: '2026-10-19T06:17:37Z' };
test('valid metadata updates native downloads, version and size in one shared request', async () => {
  const { refreshDownloadLinks } = await import(`../../src/lib/latest-release.mjs?case=${Date.now()}`);
  const anchors = [{ href: 'build.exe', download: 'build.exe' }, { href: 'build.exe', download: 'build.exe' }];
  const version = {}, size = {}; let calls = 0;
  const root = { querySelectorAll: selector => selector.includes('windows-download') ? anchors : selector.includes('version') ? [version] : [size] };
  const options = { fetcher: async () => { calls++; return { ok: true, json: async () => metadata }; } };
  await Promise.all([refreshDownloadLinks(root, options), refreshDownloadLinks(root, options)]);
  assert.equal(calls, 1); assert(anchors.every(a => a.href === metadata.assetUrl && a.download === 'app.exe'));
  assert.equal(version.textContent, 'v8.4.0'); assert.equal(size.textContent, '275.8 MB');
});
test('timeout aborts refresh and keeps build links usable', async () => {
  let signal;
  assert.equal(await fetchLatestRelease({ timeoutMs: 15, fetcher: async (_url, options) => { signal = options.signal; return new Promise(() => {}); } }), null);
  assert.equal(signal.aborted, true);
});
test('HTTP failures and malformed or foreign download metadata preserve fallback', async () => {
  for (const response of [{ ok: false, status: 500 }, { ok: true, json: async () => ({ ...metadata, assetUrl: 'https://example.com/unsafe.exe' }) }, { ok: true, json: async () => ({ ...metadata, sizeBytes: 0 }) }]) {
    assert.equal(await fetchLatestRelease({ fetcher: async () => response }), null);
  }
  const { refreshDownloadLinks } = await import(`../../src/lib/latest-release.mjs?failure=${Date.now()}`);
  const anchor = { href: 'https://build.example/app.exe' };
  await refreshDownloadLinks({ querySelectorAll: () => [anchor] }, { fetcher: async () => { throw new Error('offline'); } });
  assert.equal(anchor.href, 'https://build.example/app.exe');
});
