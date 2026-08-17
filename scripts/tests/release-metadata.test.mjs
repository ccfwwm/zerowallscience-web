import assert from 'node:assert/strict';
import test from 'node:test';
import { parseReleaseMetadata, releaseSnapshot } from '../release-metadata.mjs';

const valid = {
  version: '3.0.0',
  name: 'ZeroWall Science 3.0.0',
  publishedAt: '2026-08-17T11:16:58Z',
  assetUrl: 'https://zerowall.chengxunkeji.cn/releases/3.0.0/zerowall-science-3.0.0-win-x64.exe',
  assetName: 'zerowall-science-3.0.0-win-x64.exe',
  assetSha256: 'b0aa416e124cc2954948e01aa6f7b5cf2bd9b4199bb31238cd06611701ae1689',
  sizeBytes: 197848893,
};

test('accepts the authoritative ZeroWall Stable metadata', () => {
  const metadata = parseReleaseMetadata(valid);
  const [release] = releaseSnapshot(metadata);
  assert.equal(release.tag, 'v3.0.0');
  assert.equal(release.assets[0].url, valid.assetUrl);
  assert.equal(release.assets[0].sha256, valid.assetSha256);
});

test('rejects downloads outside the authoritative HTTPS origin', () => {
  assert.throws(() => parseReleaseMetadata({ ...valid, assetUrl: 'https://example.com/malware.exe' }), /Invalid Windows release URL/u);
  assert.throws(() => parseReleaseMetadata({ ...valid, assetUrl: 'http://zerowall.chengxunkeji.cn/setup.exe' }), /Invalid Windows release URL/u);
});

test('rejects incomplete integrity metadata', () => {
  assert.throws(() => parseReleaseMetadata({ ...valid, assetSha256: 'bad' }), /SHA-256/u);
  assert.throws(() => parseReleaseMetadata({ ...valid, sizeBytes: 0 }), /positive integer/u);
});
