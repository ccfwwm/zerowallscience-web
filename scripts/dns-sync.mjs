/**
 * Spaceship DNS sync — idempotent.
 * Usage:
 *   node scripts/dns-sync.mjs --dry-run   # preview changes
 *   node scripts/dns-sync.mjs             # apply
 *
 * Required env:
 *   SPACESHIP_API_KEY / SPACESHIP_API_SECRET
 */
const API_BASE = 'https://spaceship.dev/api/v1';
const API_KEY = process.env.SPACESHIP_API_KEY?.trim();
const API_SECRET = process.env.SPACESHIP_API_SECRET?.trim();

const SERVER_IPV4 = process.env.ZEROWALLSCIENCE_IPV4 || '66.154.100.202';
const SERVER_IPV6 = process.env.ZEROWALLSCIENCE_IPV6 || '2605:c000:4030:d::f479:19d';

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
  // Spaceship DELETE accepts a top-level array, unlike PUT which uses { items }.
  const body = JSON.stringify([
    { type: record.type, name: record.name, address: record.address || record.value },
  ]);
  const res = await fetch(`${API_BASE}/dns/records/${domain}`, {
    method: 'DELETE',
    headers,
    body,
  });
  if (!res.ok && res.status !== 404) {
    throw new Error(
      `DELETE record ${domain} ${record.type} ${record.name}: ${res.status} ${await res.text()}`,
    );
  }
}

function recordExists(existing, desired) {
  return existing.some(
    (r) => r.type === desired.type && r.name === desired.name && (r.address || r.value) === desired.address
  );
}

function isManagedRecord(record) {
  return ['A', 'AAAA'].includes(record.type) && ['@', 'www'].includes(record.name);
}

function matchesDesired(record) {
  return DESIRED_RECORDS.some(
    (desired) =>
      record.type === desired.type &&
      record.name === desired.name &&
      (record.address || record.value) === desired.address,
  );
}

async function syncDomain(domain) {
  console.log(`\n📡 ${domain}`);
  const existing = await getRecords(domain);
  console.log(`   Existing records: ${existing.length}`);

  const toCreate = DESIRED_RECORDS.filter((desired) => !recordExists(existing, desired));
  const toDelete = existing.filter((record) => isManagedRecord(record) && !matchesDesired(record));

  for (const desired of DESIRED_RECORDS) {
    const action = recordExists(existing, desired) ? 'already exists' : 'will create';
    console.log(`   ${action === 'already exists' ? '✓' : '+'} ${desired.type} ${desired.name} → ${desired.address} (${action})`);
  }
  for (const record of toDelete) {
    console.log(`   - ${record.type} ${record.name} → ${record.address || record.value} (will delete)`);
  }

  if (toCreate.length === 0 && toDelete.length === 0) {
    console.log(`   Nothing to do.`);
    return;
  }

  if (DRY_RUN) {
    console.log(`   ⏸️  DRY RUN — ${toCreate.length} record(s) would be created and ${toDelete.length} deleted.`);
    return;
  }

  // Add the new endpoint first so both servers can answer during propagation.
  for (const rec of toCreate) {
    await createRecord(domain, rec);
    console.log(`   ✅ Created ${rec.type} ${rec.name} → ${rec.address}`);
  }
  for (const rec of toDelete) {
    await deleteRecord(domain, rec);
    console.log(`   ✅ Deleted ${rec.type} ${rec.name} → ${rec.address || rec.value}`);
  }
}

async function main() {
  if (!API_KEY || !API_SECRET) {
    throw new Error('SPACESHIP_API_KEY and SPACESHIP_API_SECRET are required');
  }
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
