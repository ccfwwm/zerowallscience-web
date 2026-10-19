import { mkdir, writeFile, stat } from 'node:fs/promises';
import { createReadStream, createWriteStream } from 'node:fs';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { createHash } from 'node:crypto';
import { resolve, join } from 'node:path';
import assert from 'node:assert/strict';
import { parseReleaseMetadata, RELEASE_METADATA_URL } from './release-metadata.mjs';
const root = resolve(import.meta.dirname, '../artifacts/download-verification');
await mkdir(root, { recursive: true });
const metadata = parseReleaseMetadata(await (await fetch(RELEASE_METADATA_URL)).json());
const file = join(root, metadata.assetName);
if ((await stat(file).catch(() => null))?.size !== metadata.sizeBytes) {
  const response = await fetch(metadata.assetUrl, { signal: AbortSignal.timeout(600000) });
  assert.equal(response.status, 200);
  await pipeline(Readable.fromWeb(response.body), createWriteStream(file));
}
const digest = createHash('sha256'); for await (const chunk of createReadStream(file)) digest.update(chunk);
const sha256 = digest.digest('hex'), size = (await stat(file)).size;
assert.equal(size, metadata.sizeBytes); assert.equal(sha256, metadata.assetSha256);
const report = { checkedAt: new Date().toISOString(), url: metadata.assetUrl, version: metadata.version, bytes: size, sha256, verified: true };
await writeFile(join(root, 'receipt.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report));
