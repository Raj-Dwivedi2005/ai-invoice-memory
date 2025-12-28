import Database = require("better-sqlite3");



const db = new Database("memory.db");

// Create memory table
db.prepare(`
  CREATE TABLE IF NOT EXISTS memory (
    id TEXT PRIMARY KEY,
    vendor TEXT,
    type TEXT, -- vendor | correction | resolution
    key TEXT,
    value TEXT,
    confidence REAL,
    approvedCount INTEGER,
    rejectedCount INTEGER,
    usageCount INTEGER,
    lastUpdated TEXT
  )
`).run();


// Create duplicate invoice tracking table
db.prepare(`
  CREATE TABLE IF NOT EXISTS invoices_seen (
    vendor TEXT,
    invoiceNumber TEXT,
    createdAt TEXT
  )
`).run();


export interface MemoryRecord {
  id: string;
  vendor: string;
  type: "VENDOR" | "CORRECTION" | "RESOLUTION";
  key: string;
  value: string;
  confidence: number;
  approvedCount: number;
  rejectedCount: number;
  usageCount: number;
  lastUpdated: string;
}

// Insert new memory
export function insertMemory(
  vendor: string,
  type: MemoryRecord["type"],
  key: string,
  value: string,
  confidence = 0.6
) {
  db.prepare(`
    INSERT INTO memory
    (id, vendor, type, key, value, confidence, approvedCount, rejectedCount, usageCount, lastUpdated)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    Date.now().toString(),
    vendor,
    type,
    key,
    value,
    confidence,
    0,
    0,
    1,
    new Date().toISOString()
  );
}

// Get memory by vendor
export function getMemoryByVendor(vendor: string): MemoryRecord[] {
  return db
    .prepare(`SELECT * FROM memory WHERE vendor = ?`)
    .all(vendor) as MemoryRecord[];
}

// ✅ Approve memory (reinforcement)
export function approveMemory(id: string) {
  db.prepare(`
    UPDATE memory
    SET 
      approvedCount = approvedCount + 1,
      confidence = MIN(confidence + 0.1, 1),
      usageCount = usageCount + 1,
      lastUpdated = ?
    WHERE id = ?
  `).run(
    new Date().toISOString(),
    id
  );
}

// ❌ Reject memory (decay)
export function rejectMemory(id: string) {
  db.prepare(`
    UPDATE memory
    SET 
      rejectedCount = rejectedCount + 1,
      confidence = MAX(confidence - 0.2, 0),
      lastUpdated = ?
    WHERE id = ?
  `).run(
    new Date().toISOString(),
    id
  );
}


// Check if invoice is duplicate
export function isDuplicateInvoice(
  vendor: string,
  invoiceNumber: string
): boolean {
  const row = db.prepare(`
    SELECT 1 FROM invoices_seen
    WHERE vendor = ? AND invoiceNumber = ?
  `).get(vendor, invoiceNumber);

  return !!row;
}

// Mark invoice as processed
export function markInvoiceSeen(
  vendor: string,
  invoiceNumber: string
) {
  db.prepare(`
    INSERT INTO invoices_seen (vendor, invoiceNumber, createdAt)
    VALUES (?, ?, ?)
  `).run(
    vendor,
    invoiceNumber,
    new Date().toISOString()
  );
}

