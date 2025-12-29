import { processInvoice } from "../agent/processInvoice";
import { applyHumanCorrection } from "../agent/humanFeedback";

// ✅ Test invoices covering all expected outcomes
const invoices = [
  // Supplier GmbH – learning serviceDate + PO auto-suggestion
  {
    invoiceId: "INV-A-001",
    vendor: "Supplier GmbH",
    fields: {
      invoiceNumber: "INV-2024-001",
      invoiceDate: "12.01.2024",
      serviceDate: null,
      currency: "EUR",
      netTotal: 2500,
      taxRate: 0.19,
      taxTotal: 475,
      grossTotal: 2975,
      lineItems: [{ sku: "WIDGET-001", qty: 100, unitPrice: 25 }],
    },
  },
  {
    invoiceId: "INV-A-003",
    vendor: "Supplier GmbH",
    fields: {
      invoiceNumber: "INV-2024-003",
      invoiceDate: "20.01.2024",
      serviceDate: null,
      currency: "EUR",
      netTotal: 1200,
      taxRate: 0.19,
      taxTotal: 228,
      grossTotal: 1428,
      lineItems: [{ sku: "WIDGET-002", qty: 50, unitPrice: 24 }],
    },
  },
  // Parts AG – VAT-inclusive + currency recovery
  {
    invoiceId: "INV-B-001",
    vendor: "Parts AG",
    fields: {
      invoiceNumber: "PA-7781",
      invoiceDate: "05-02-2024",
      rawText: "Prices incl. VAT\nCurrency: EUR",
      netTotal: 2000,
      taxRate: 0.19,
      taxTotal: 400,
      grossTotal: 2400,
      lineItems: [{ sku: "BOLT-99", qty: 200, unitPrice: 10 }],
    },
  },
  {
    invoiceId: "INV-B-002",
    vendor: "Parts AG",
    fields: {
      invoiceNumber: "PA-7799",
      invoiceDate: "20-02-2024",
      rawText: "MwSt. inkl.\nCurrency: EUR",
      netTotal: 1500,
      taxRate: 0.19,
      taxTotal: 285,
      grossTotal: 1785,
      lineItems: [{ sku: "BOLT-99", qty: 150, unitPrice: 10 }],
    },
  },
  // Freight & Co – Skonto + Seefracht mapping
  {
    invoiceId: "INV-C-001",
    vendor: "Freight & Co",
    fields: {
      invoiceNumber: "FC-1001",
      invoiceDate: "01.03.2024",
      rawText: "Skonto 2% if paid within 10 days\nShipping via Seefracht",
      currency: "EUR",
      netTotal: 980,
      taxRate: 0.19,
      taxTotal: 186.2,
      grossTotal: 1166.2,
      lineItems: [{ description: "Transport charges", qty: 1, unitPrice: 1000 }],
    },
  },
  // Duplicate test – Supplier GmbH
  {
    invoiceId: "INV-A-004",
    vendor: "Supplier GmbH",
    fields: {
      invoiceNumber: "INV-2024-001",
      invoiceDate: "25.01.2024",
      serviceDate: null,
      currency: "EUR",
      netTotal: 1300,
      taxRate: 0.19,
      taxTotal: 247,
      grossTotal: 1547,
      lineItems: [{ sku: "WIDGET-003", qty: 50, unitPrice: 26 }],
    },
  },
  // Duplicate test – Parts AG
  {
    invoiceId: "INV-B-004",
    vendor: "Parts AG",
    fields: {
      invoiceNumber: "PA-7781",
      invoiceDate: "06-02-2024",
      rawText: "Prices incl. VAT\nCurrency: EUR",
      netTotal: 2100,
      taxRate: 0.19,
      taxTotal: 399,
      grossTotal: 2499,
      lineItems: [{ sku: "BOLT-100", qty: 210, unitPrice: 10 }],
    },
  },
];

// Optional: human corrections JSON
const humanCorrections = [
  {
    invoiceId: "INV-A-001",
    vendor: "Supplier GmbH",
    corrections: [{ field: "serviceDate", to: "12.01.2024" }],
    finalDecision: "approved",
  },
];

console.log("========== AI INVOICE DEMO ==========");

for (const invoice of invoices) {
  console.log(`\n--- Processing invoice ${invoice.invoiceId} (${invoice.vendor}) ---`);

  const firstPass = processInvoice(invoice);
  console.log("Before human correction:");
  console.log(JSON.stringify(firstPass, null, 2));

  // 🔁 Apply human correction if exists
  const correction = humanCorrections.find((c) => c.invoiceId === invoice.invoiceId);

  if (correction) {
    const correctionMap: Record<string, any> = {};
    for (const c of correction.corrections) {
      correctionMap[c.field] = c.to;
    }

    applyHumanCorrection(
      correction.vendor,
      invoice.fields.invoiceNumber,
      correctionMap,
      correction.finalDecision === "approved"
    );

    console.log("After human correction applied:");
    const secondPass = processInvoice(invoice);
    console.log(JSON.stringify(secondPass, null, 2));
  }
}


