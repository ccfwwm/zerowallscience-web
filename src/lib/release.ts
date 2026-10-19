import releases from '../data/releases.json';
const latest = releases[0];
const asset = latest.assets.find(item => item.name.endsWith('.exe'))!;
export const release = { version: latest.tag.replace(/^v/, ''), assetUrl: asset.url, assetName: asset.name, sizeBytes: asset.size, assetSha256: asset.sha256, publishedAt: latest.published };
export const releaseSize = `${(release.sizeBytes / 1024 / 1024).toFixed(1)} MB`;
