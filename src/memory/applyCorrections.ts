import { loadJSON } from "../utils/loadData";
import { getMemoryByVendor, updateMemory, insertMemory } from "../db/database";

type Correction = {
  invoiceId: string;
  vendor: string;
  corrections: { field: string; from: any; to: any; reason: string }[];
  finalDecision: "approved" | "rejected";
};

const corrections: Correction[] = loadJSON("human_corrections.json");

for (const c of corrections) {
  console.log(`Applying corrections for vendor: ${c.vendor}, invoice: ${c.invoiceId}`);

  for (const change of c.corrections) {
    // Get all memory for this vendor
    const memoryEntries = getMemoryByVendor(c.vendor);

    // Try to find existing memory for this field
    const entry = memoryEntries.find((m) => m.key === change.field);

    if (entry) {
      // Update value and increase confidence
      updateMemory(entry.id, Math.min(entry.confidence + 0.2, 1));
      console.log(`Updated memory key: ${change.field}, confidence increased`);
    } else {
      // Insert new memory if not exists
      insertMemory(c.vendor, "CORRECTION", change.field, change.to, 0.8);
      console.log(`Inserted new memory key: ${change.field}`);
    }
  }
}

console.log("All human corrections applied.");

