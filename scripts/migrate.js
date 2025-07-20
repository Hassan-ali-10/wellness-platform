#!/usr/bin/env node
"use strict";
/**
 * Migration script that works for both local Postgres and Neon serverless.
 */

const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const { URL } = require("url");

// Load environment variables
const envPath = process.env.ENV_PATH || path.resolve(__dirname, "../.env");
if (fs.existsSync(envPath)) {
  require("dotenv").config({ path: envPath });
  console.log(`[env] Loaded ${envPath}`);
} else {
  require("dotenv").config();
}

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL not set");
  process.exit(1);
}

// Command-line arguments
const args = process.argv.slice(2);
const argFlags = new Set(args);
const reset = argFlags.has("--reset");
const redo = argFlags.has("--redo");

// Determine if using Neon or local Postgres
let isLocal = false;
try {
  const dbUrl = new URL(DATABASE_URL);
  isLocal = /^(localhost|127\.0\.0\.1|::1)$/i.test(dbUrl.hostname);
} catch (_) {
  console.warn("[warn] Could not parse DATABASE_URL");
}

let exec;
let begin, commit, rollback;

if (isLocal) {
  const { Client } = require("pg");
  const client = new Client({ connectionString: DATABASE_URL });
  exec = (text, params = []) => client.query(text, params);
  begin = () => exec("BEGIN");
  commit = () => exec("COMMIT");
  rollback = () => exec("ROLLBACK");
  (async () => {
    await client.connect();
    console.log("[db] Connected to local Postgres");
  })();
} else {
  const { neon } = require("@neondatabase/serverless");
  const sql = neon(DATABASE_URL);
  exec = (query, params = []) => (params.length ? sql(query, params) : sql([query]));
  begin = () => exec("BEGIN");
  commit = () => exec("COMMIT");
  rollback = () => exec("ROLLBACK");
  console.log("[db] Using Neon serverless client");
}

function isBcryptHash(str) {
  return /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(str);
}

async function resolveAdminHash() {
  const explicit = process.env.ADMIN_PASSWORD_HASH?.trim();
  if (explicit) return explicit;
  const pwd = (process.env.ADMIN_PASSWORD || "admin123").trim();
  if (isBcryptHash(pwd)) return pwd;
  return bcrypt.hash(pwd, 10);
}

async function createSchema() {
  await exec(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`).catch(() => {});
  await exec(`CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id TEXT UNIQUE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );`);
  await exec(`CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id TEXT UNIQUE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    appointment_date TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    status TEXT DEFAULT 'scheduled',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );`);
  await exec(`CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );`);
}

async function dropSchema() {
  await exec(`DROP TABLE IF EXISTS appointments CASCADE;`);
  await exec(`DROP TABLE IF EXISTS clients CASCADE;`);
  await exec(`DROP TABLE IF EXISTS admins CASCADE;`);
}

async function seedAdmin(update = false) {
  const email = process.env.ADMIN_EMAIL || "admin@wellness.com";
  const name = process.env.ADMIN_NAME || "Admin User";
  const hash = await resolveAdminHash();
  if (update) {
    await exec(`INSERT INTO admins (email,password_hash,name) VALUES ($1,$2,$3)
    ON CONFLICT (email) DO UPDATE SET password_hash=EXCLUDED.password_hash, name=EXCLUDED.name;`,
    [email, hash, name]);
  } else {
    await exec(`INSERT INTO admins (email,password_hash,name) VALUES ($1,$2,$3)
    ON CONFLICT (email) DO NOTHING;`, [email, hash, name]);
  }
  console.log(`Admin seeded: ${email}`);
}

async function seedClients(redo = false) {
  const clients = [
    { external_id: "client_1", name: "John Doe", email: "john.doe@email.com", phone: "+1-555-0101" },
    { external_id: "client_2", name: "Jane Smith", email: "jane.smith@email.com", phone: "+1-555-0102" },
    { external_id: "client_3", name: "Bob Johnson", email: "bob.johnson@email.com", phone: "+1-555-0103" },
  ];
  for (const c of clients) {
    const q = redo ?
      `INSERT INTO clients (external_id,name,email,phone) VALUES ($1,$2,$3,$4)
       ON CONFLICT (email) DO UPDATE SET external_id=EXCLUDED.external_id, name=EXCLUDED.name, phone=EXCLUDED.phone;` :
      `INSERT INTO clients (external_id,name,email,phone) VALUES ($1,$2,$3,$4)
       ON CONFLICT (email) DO NOTHING;`;
    await exec(q, [c.external_id, c.name, c.email, c.phone]);
  }
  console.log("Clients seeded.");
}

async function main() {
  try {
    await begin();
    if (reset) {
      console.log("Dropping schema...");
      await dropSchema();
    }
    await createSchema();
    await seedAdmin(reset || redo);
    await seedClients(redo);
    await commit();
    console.log("✅ Migration complete");
  } catch (err) {
    await rollback();
    console.error("❌ Migration failed:", err);
    process.exit(1);
  }
}

main();
