import { processInvoice } from "../agent/processInvoice";
import invoices from "../data/invoices.json";

console.log("FIRST RUN (before learning):");
console.log(processInvoice(invoices[0]));

console.log("\nSECOND RUN (after learning):");
console.log(processInvoice(invoices[1]));

