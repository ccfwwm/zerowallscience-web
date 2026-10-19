// Capture the shipped 8.4.0 Host UI with a new, empty, local-only profile.
import { createRequire } from 'node:module';
import { mkdir, writeFile, readdir, symlink } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawn } from 'node:child_process';
const require = createRequire(import.meta.url);
const asar = require('C:/softworks/gpt-tools/zerowallscience/desktop/node_modules/@electron/asar');
const root = resolve(import.meta.dirname, '..');
const software = resolve(root, '../zerowallscience');
const stage = join(software, 'artifacts/stage/8.4.0/1792389016362-d571bc61');
const home = join(root, 'artifacts/product-host');
const profile = join(home, 'profiles/web');
await mkdir(profile, { recursive: true });
if (!existsSync(join(profile, 'node_modules/@zerowallscience/plugin-base'))) asar.extractAll(join(stage, 'offline-profile/profile-runtime.asar'), profile);
const runtimeModules = join(stage, 'runtime/node_modules');
for (const entry of await readdir(runtimeModules, { withFileTypes: true })) {
  const scope = entry.name.startsWith('@');
  const packages = scope ? (await readdir(join(runtimeModules, entry.name))).map(name => join(entry.name, name)) : [entry.name];
  for (const name of packages) {
    const destination = join(profile, 'node_modules', name);
    if (!existsSync(destination)) { await mkdir(dirname(destination), { recursive: true }); await symlink(join(runtimeModules, name), destination, 'junction'); }
  }
}
const defaults = JSON.parse(await (await import('node:fs/promises')).readFile(join(stage, 'commands/default-plugins.json'), 'utf8'));
await writeFile(join(profile, 'package.json'), JSON.stringify({ name: 'zerowall-website-capture', private: true, type: 'module', dsh: { profile: { bundles: defaults } } }));
await writeFile(join(profile, 'cordis.patch.yml'), '- id: dsh-wechat\n  config:\n    autoStart: false\n');
const entry = join(runtimeModules, '@deepseek-ai/dsh/lib/bin.js');
const env = { ...process.env, DSH_HOME: home, HOME: home, USERPROFILE: home, APPDATA: join(home, 'appdata'), LOCALAPPDATA: join(home, 'localappdata'), DSH_AGENTS_HOME: join(home, 'agents'), ZEROWALL_USER_DATA_DIR: home, ZEROWALL_RESEARCH_DB: join(home, 'research.sqlite'), ZEROWALL_USER_SKILLS: join(home, 'skills'), ZEROWALL_DISABLE_DEFAULT_MCP: '1', DSH_TELEMETRY_DISABLED: '1', ZEROWALL_RUNTIME_ANCHOR: pathToFileURL(entry).href, ZEROWALL_BUNDLED_SKILLS: join(stage, 'resources/extensions/skills'), DSH_BUNDLED_SKILL_DIR: join(stage, 'resources/extensions/skills') };
delete env.ELECTRON_RUN_AS_NODE;
env.ZEROWALL_BRAND_ICON = join(software, 'resources/branding/zerowall/zerowall-icon.png');
const child = spawn(process.execPath, ['--import', pathToFileURL(join(software, 'desktop/build/runtime-esm-register.mjs')).href, '--expose-internals', join(software, 'desktop/build/harness-node-entry.mjs'), entry, 'web', '--patch', join(stage, 'resources/zerowall-core.patch.yml'), '--host', '127.0.0.1', '--port', '4332', '--no-open'], { cwd: home, env, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe', 'ipc'] });
let output = '';
const capture = bytes => { output = (output + bytes.toString()).slice(-80000); process.stdout.write(bytes.toString().replace(/token=[^\s"']+/g, 'token=[redacted]')); };
child.stdout.on('data', capture); child.stderr.on('data', capture);
child.on('message', message => { if (message?.kind === 'zerowall-secret-request') child.send({ kind: 'zerowall-secret-response', requestId: message.requestId, ok: true }); });
child.once('error', error => { console.error(String(error)); process.exitCode = 1; });
child.once('exit', async code => { await writeFile(join(home, 'host.log'), output.replace(/token=[^\s"']+/g, 'token=[redacted]')); process.exitCode = code || 0; });
process.on('SIGINT', () => child.kill());
// Store the local auth URL privately for the capture step; never print its token.
const timer = setInterval(async () => { const url = /http:\/\/127\.0\.0\.1:4332\/\?token=[A-Za-z0-9_-]+/.exec(output)?.[0]; if (url) { await writeFile(join(home, 'capture-url.txt'), url); clearInterval(timer); } if (child.exitCode !== null) clearInterval(timer); }, 500);
