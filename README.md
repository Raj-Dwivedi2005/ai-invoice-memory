# 🧠 AI Invoice Memory & Auto-Correction System

## 📌 Overview

This project demonstrates an AI-inspired invoice processing system that:

- Normalizes invoice data
- Learns from human corrections
- Applies vendor-specific rules
- Detects duplicate invoices
- Improves accuracy over time using persistent memory

The system simulates how an AI-powered accounting assistant can gradually reduce manual review by learning patterns from historical invoices while maintaining safety and auditability.

---

## 🎯 Key Features

### ✅ Vendor-Specific Learning

The system remembers corrections per vendor and automatically re-applies them to future invoices.

**Examples:**
- **Supplier GmbH**: Learns service date extraction and purchase order auto-matching
- **Parts AG**: Learns VAT-inclusive pricing and currency recovery from raw text
- **Freight & Co**: Learns Skonto (early payment discount) detection and freight-related patterns

---

### 🔁 Human-in-the-Loop Feedback

Human corrections are applied via `human_corrections.json` and persisted as structured memory, allowing the system to improve without hardcoding rules.

---

### 🧠 Persistent Memory

- Memory is stored locally in `memory.db`
- Prevents contradictory learning
- Enables duplicate detection across historical invoices
- Allows gradual confidence-based automation

---

### 🚨 Duplicate Detection

Invoices with:
- Same vendor
- Same invoice number
- Close invoice dates

are flagged for human review and do **not** create conflicting memory entries.

---

## 🏗️ Project Structure

src/
├── agent/
│ ├── processInvoice.ts # Core invoice logic & learning
│ ├── humanFeedback.ts # Applies human corrections
│ └── types.ts # Shared TypeScript types
│
├── data/
│ ├── invoices.json # Input invoices
│ ├── purchase_orders.json # PO reference data
│ ├── delivery_notes.json # Delivery notes
│ ├── reference_data.json # Aggregated reference data
│ └── human_corrections.json
│
├── db/
│ └── database.ts # Memory persistence
│
├── demo/
│ └── runDemo.ts # Sequential demo runner
│
├── memory/
│ └── memory.db # Generated at runtime
│
└── utils/, engine/, test/


---

## ▶️ How the System Works

1. Invoice is normalized
2. Vendor-specific memory is recalled
3. Auto-corrections are applied if confidence is high
4. Duplicate detection is performed
5. Decision is made:
   - Auto-approve
   - Escalate to human review
6. Memory is updated only when learning is safe

Each step is logged in an **audit trail** for transparency.

---

## 🧪 Demo Runner

The demo runner processes all invoices sequentially and prints:

- Normalized invoice
- Proposed corrections
- Human review decision
- Memory updates
- Audit trail

### Run the demo:

```bash
npm install
npm run demo


📊 Verified Outcomes

✔ Supplier GmbH service dates auto-filled
✔ Supplier GmbH PO auto-matching
✔ Parts AG VAT-inclusive pricing learned
✔ Currency recovered from raw text
✔ Freight & Co Skonto detection learned
✔ Duplicate invoices correctly flagged


🛠️ Tech Stack

TypeScript

Node.js

ts-node

Lightweight local persistence (file-based memory)



🎥 Demo Video

📹 Demo video link is attached directly in the submission email, as required.


## 📬 Submission

This repository contains the solution submitted as part of the technical assignment for Flowbit AI.


👤 Author

Raj Dwivedi
📧 Email: rajiaf202704@gmail.com
🔗 GitHub: https://github.com/
<Raj-Dwivedi2005>