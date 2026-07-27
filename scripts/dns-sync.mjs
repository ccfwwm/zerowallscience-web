/**
 * Spaceship DNS sync — idempotent.
 * Usage:
 *   node scripts/dns-sync.mjs --dry-run   # preview changes
 *   node scripts/dns-sync.mjs             # apply
 *
 * Env (or hardcoded for this project):
 *   SPACESHIP_API_KEY / SPACESHIP_API_SECRET
 */
const API_BASE = 'https://spaceship.dev/api/v1';
const API_KEY = process.env.SPACESHIP_API_KEY || 'c3w8Huxl7W5RUKa8fAe4';
const API_SECRET = process.env.SPACESHIP_API_SECRET || 'fCCl5jVQCqPXQuy8nybgCA4q3XMffBpTqa7nsNpeoUw7HbPamL7QqrVcaGFvrlAJ';

const SERVER_IPV4 = '185.132.54.223';
const SERVER_IPV6 = '2400:8d60:2::1:b826:eede';

// Desired DNS state — both domains get the same records
const DOMAINS = ['zerowallscience.org', 'zerowallscience.com'];
const DESIRED_RECORDS = [
  { type: 'A', name: '@', address: SERVER_IPV4, ttl: 3600 },
  { type: 'AAAA', name: '@', address: SERVER_IPV6, ttl: 3600 },
  { type: 'A', name: 'www', address: SERVER_IPV4, ttl: 3600 },
  { type: 'AAAA', name: 'www', address: SERVER_IPV6, ttl: 3600 },
];

const DRY_RUN = process.argv.includes('--dry-run');
const headers = {
  'X-API-Key': API_KEY,
  'X-API-Secret': API_SECRET,
  'Content-Type': 'application/json',
};

async function getRecords(domain) {
  const res = await fetch(`${API_BASE}/dns/records/${domain}?take=100&skip=0`, { headers });
  if (!res.ok) throw new Error(`GET records ${domain}: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.items || [];
}

async function createRecord(domain, record) {
  const body = JSON.stringify({ items: [record] });
  const res = await fetch(`${API_BASE}/dns/records/${domain}`, {
    method: 'PUT',
    headers,
    body,
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`PUT record ${domain} ${record.type} ${record.name}: ${res.status} ${txt}`);
  }
}

async function deleteRecord(domain, record) {
  // Spaceship uses DELETE with the record in the body
  const body = JSON.stringify({ items: [{ type: record.type, name: record.name, address: record.address }] });
  const res = await fetch(`${API_BASE}/dns/records/${domain}`, {
    method: 'DELETE',
    headers,
    body,
  });
  // 404 or success are fine
  if (!res.ok && res.status !== 404) {
    const txt = await res.text();
    console.warn(`   ⚠️  DELETE ${record.type} ${record.name}: ${res.status} ${txt}`);
  }
}

function recordExists(existing, desired) {
  return existing.some(
    (r) => r.type === desired.type && r.name === desired.name && (r.address || r.value) === desired.address
  );
}

async function syncDomain(domain) {
  console.log(`\n📡 ${domain}`);
  const existing = await getRecords(domain);
  console.log(`   Existing records: ${existing.length}`);

  const toCreate = [];
  for (const desired of DESIRED_RECORDS) {
    if (recordExists(existing, desired)) {
      console.log(`   ✓ ${desired.type} ${desired.name} → ${desired.address} (already exists)`);
    } else {
      toCreate.push(desired);
      console.log(`   + ${desired.type} ${desired.name} → ${desired.address} (will create)`);
    }
  }

  if (toCreate.length === 0) {
    console.log(`   Nothing to do.`);
    return;
  }

  if (DRY_RUN) {
    console.log(`   ⏸️  DRY RUN — ${toCreate.length} record(s) would be created.`);
    return;
  }

  for (const rec of toCreate) {
    await createRecord(domain, rec);
    console.log(`   ✅ Created ${rec.type} ${rec.name} → ${rec.address}`);
  }
}

async function main() {
  console.log(DRY_RUN ? '🔍 DRY RUN MODE' : '🚀 APPLYING CHANGES');
  for (const domain of DOMAINS) {
    await syncDomain(domain);
  }
  console.log('\n✅ Done.');
}

main().catch((err) => {
  console.error('❌ Fatal:', err.message);
  process.exit(1);
});
