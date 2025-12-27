import { loadJSON } from "../utils/loadData";
import { insertMemory } from "../db/database";

type Invoice = {
  vendor: string;
  payment_terms: string;
  currency: string;
};

const invoices: Invoice[] = loadJSON("invoices.json");

for (const invoice of invoices) {
  // Learn payment terms
  insertMemory(
    invoice.vendor,
    "VENDOR",
    "payment_terms",
    invoice.payment_terms,
    0.7
  );

  // Learn currency preference
  insertMemory(
    invoice.vendor,
    "VENDOR",
    "currency",
    invoice.currency,
    0.7
  );
}

console.log("Memory extracted from invoices");

