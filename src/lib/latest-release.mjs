import { parseReleaseMetadata, RELEASE_METADATA_URL } from '../../scripts/release-metadata.mjs';
export async function fetchLatestRelease({ fetcher = fetch, timeoutMs = 3000, metadataUrl = RELEASE_METADATA_URL } = {}) {
  const controller = new AbortController(); let timer;
  try {
    return await Promise.race([
      (async () => { const response = await fetcher(metadataUrl, { signal: controller.signal, cache: 'no-store', credentials: 'omit' }); if (!response.ok) throw new Error(`Release metadata HTTP ${response.status}`); return parseReleaseMetadata(await response.json(), metadataUrl); })(),
      new Promise((_, reject) => { timer = setTimeout(() => { controller.abort(); reject(new Error('Release metadata timeout')); }, timeoutMs); }),
    ]);
  } catch { return null; } finally { clearTimeout(timer); }
}
let refresh;
export function refreshDownloadLinks(root = document, options = {}) {
  refresh ??= fetchLatestRelease(options);
  return refresh.then(metadata => { if (!metadata) return;
    root.querySelectorAll('[data-latest-windows-download]').forEach(link => { link.href = metadata.assetUrl; link.download = metadata.assetName; });
    root.querySelectorAll('[data-release-version]').forEach(node => { node.textContent = `v${metadata.version}`; });
    root.querySelectorAll('[data-release-size]').forEach(node => { node.textContent = `${(metadata.sizeBytes / 1024 / 1024).toFixed(1)} MB`; });
  });
}
