import invoices from "../data/invoices.json";
import humanCorrections from "../data/human_corrections.json";
import { processInvoice } from "../agent/processInvoice";
import { applyHumanCorrection } from "../agent/humanFeedback";

console.log("========== FIRST RUN (before learning) ==========");

const firstInvoice = invoices[0];
const firstResult = processInvoice(firstInvoice);
console.log(firstResult);

// 🔁 Simulate human approval
const correction = humanCorrections.find(
  c => c.invoiceId === firstInvoice.invoiceId
);

if (correction) {
  const correctionMap: Record<string, any> = {};

  for (const c of correction.corrections) {
    correctionMap[c.field] = c.to;
  }

  applyHumanCorrection(
    correction.vendor,
    firstInvoice.fields.invoiceNumber,
    correctionMap,
    correction.finalDecision === "approved"
  );
}

console.log("\n========== SECOND RUN (after learning) ==========");

const secondInvoice = invoices[1];
const secondResult = processInvoice(secondInvoice);
console.log(secondResult);

