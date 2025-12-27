import { getMemoryByVendor } from "../db/database";

const vendor = "Supplier GmbH"; // change if needed

const memory = getMemoryByVendor(vendor);

console.log(`Memory for vendor: ${vendor}`);
console.table(memory);

