import {
  getMemoryByVendor,
  isDuplicateInvoice,
  markInvoiceSeen
} from "../db/database";

type Invoice = {
  invoiceId: string;
  vendor: string;
  fields: Record<string, any>;
};

export function processInvoice(invoice: Invoice) {
  const invoiceNumber = invoice.fields.invoiceNumber;

  /* ======================================================
     1️⃣ DUPLICATE CHECK (ABSOLUTELY FIRST)
     ====================================================== */
  if (invoiceNumber && isDuplicateInvoice(invoice.vendor, invoiceNumber)) {
    const auditTrail = [
      {
        step: "decide",
        timestamp: new Date().toISOString(),
        details: "Duplicate invoice detected. Escalated for human review."
      }
    ];

    return {
      normalizedInvoice: invoice.fields,
      proposedCorrections: [],
      requiresHumanReview: true,
      reasoning: "Duplicate invoice detected based on vendor and invoice number",
      confidenceScore: 0,
      memoryUpdates: [],
      auditTrail
    };
  }

  /* ======================================================
     2️⃣ MEMORY RECALL
     ====================================================== */
  const memory = getMemoryByVendor(invoice.vendor);
  const auditTrail: any[] = [];

  auditTrail.push({
    step: "recall",
    timestamp: new Date().toISOString(),
    details: `Loaded ${memory.length} memory entries for vendor ${invoice.vendor}`
  });

  let requiresHumanReview = false;
  const appliedCorrections: string[] = [];

  /* ======================================================
     3️⃣ APPLY MEMORY
     ====================================================== */
  for (const m of memory) {
    if (m.confidence >= 0.8 && invoice.fields[m.key] == null) {
      invoice.fields[m.key] = m.value;

      appliedCorrections.push(
        `Auto-filled ${m.key} from memory (confidence ${m.confidence})`
      );

      auditTrail.push({
        step: "apply",
        timestamp: new Date().toISOString(),
        details: `Applied memory key '${m.key}' with confidence ${m.confidence}`
      });
    }

    if (m.confidence < 0.6) {
      requiresHumanReview = true;
    }
  }

  /* ======================================================
     4️⃣ DECISION LOGIC
     ====================================================== */

  // If nothing was auto-applied → escalate
  if (appliedCorrections.length === 0) {
    requiresHumanReview = true;
  }

  auditTrail.push({
    step: "decide",
    timestamp: new Date().toISOString(),
    details: requiresHumanReview
      ? "Escalated due to insufficient or low-confidence memory"
      : "Auto-approved using high-confidence memory"
  });

  /* ======================================================
     5️⃣ LEARN (ONLY IF AUTO-APPROVED)
     ====================================================== */
  if (invoiceNumber && !requiresHumanReview) {
    markInvoiceSeen(invoice.vendor, invoiceNumber);

    auditTrail.push({
      step: "learn",
      timestamp: new Date().toISOString(),
      details: `Marked invoice ${invoiceNumber} as processed`
    });
  }

  /* ======================================================
     6️⃣ FINAL RESPONSE
     ====================================================== */
  return {
    normalizedInvoice: invoice.fields,
    proposedCorrections: appliedCorrections,
    requiresHumanReview,
    reasoning: appliedCorrections.length
      ? "Applied high-confidence learned memory"
      : "Insufficient confidence for auto-application",
    confidenceScore: Math.min(
      1,
      memory.reduce((a, b) => a + b.confidence, 0) /
        Math.max(memory.length, 1)
    ),
    memoryUpdates: appliedCorrections,
    auditTrail
  };
}
