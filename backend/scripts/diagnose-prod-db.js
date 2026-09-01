/**
 * Prod DB baglanti teshisi.
 * Calistir:  node scripts/diagnose-prod-db.js
 * .env.production'daki DATABASE_URL'i parse edip farkli host/port/SSL kombinasyonlarini dener.
 */
const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.production') });

const raw = process.env.DATABASE_URL;
if (!raw) {
  console.error('DATABASE_URL bulunamadi (.env.production)');
  process.exit(1);
}

const u = new URL(raw);
const user = decodeURIComponent(u.username);          // postgres.<ref>  veya  postgres
const pass = decodeURIComponent(u.password);
const ref = user.includes('.') ? user.split('.')[1] : null;
const region = (u.hostname.match(/aws-\d+-([a-z0-9-]+)\.pooler/) || [])[1] || 'eu-central-1';

console.log('mevcut URL host:', u.hostname, 'port:', u.port, 'user:', user);
console.log('project ref   :', ref, '| region:', region);
console.log('---');

const targets = [
  { label: 'MEVCUT (env)', host: u.hostname, port: u.port || '5432', user },
];
if (ref) {
  targets.push(
    { label: 'transaction pooler aws-0', host: `aws-0-${region}.pooler.supabase.com`, port: '6543', user: `postgres.${ref}` },
    { label: 'transaction pooler aws-1', host: `aws-1-${region}.pooler.supabase.com`, port: '6543', user: `postgres.${ref}` },
    { label: 'session pooler aws-0',     host: `aws-0-${region}.pooler.supabase.com`, port: '5432', user: `postgres.${ref}` },
    { label: 'session pooler aws-1',     host: `aws-1-${region}.pooler.supabase.com`, port: '5432', user: `postgres.${ref}` },
    { label: 'direct db.<ref>',          host: `db.${ref}.supabase.co`,               port: '5432', user: 'postgres' },
  );
}

(async () => {
  for (const t of targets) {
    const client = new Client({
      host: t.host,
      port: Number(t.port),
      user: t.user,
      password: pass,
      database: 'postgres',
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 8000,
    });
    try {
      await client.connect();
      const r = await client.query('SELECT 1 AS ok');
      console.log(`OK  ${t.label.padEnd(26)} ${t.host}:${t.port}  ->`, r.rows[0]);
      await client.end();
    } catch (e) {
      console.log(`FAIL ${t.label.padEnd(26)} ${t.host}:${t.port}  ->  ${e.code || ''} ${e.message}`);
      try { await client.end(); } catch {}
    }
  }
})();
