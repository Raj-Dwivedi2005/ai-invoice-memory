import { loadJSON } from "../utils/loadData";

const invoices = loadJSON("invoices.json");
console.log("Invoices loaded:", invoices.length);

