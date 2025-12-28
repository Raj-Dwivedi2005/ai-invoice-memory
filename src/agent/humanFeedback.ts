import {
  insertMemory,
  getMemoryByVendor,
  approveMemory,
  rejectMemory
} from "../db/database";

export function applyHumanCorrection(
  vendor: string,
  invoiceNumber: string,
  corrections: Record<string, any>,
  approved: boolean
) {
  // Load existing memory for vendor
  const existingMemory = getMemoryByVendor(vendor);

  for (const [field, value] of Object.entries(corrections)) {
    // Check if memory already exists
    const memory = existingMemory.find(
      m => m.key === field && m.value === String(value)
    );

    if (!memory) {
      // NEW learning → store memory
      insertMemory(
        vendor,
        "VENDOR",
        field,
        String(value),
        approved ? 0.7 : 0.4
      );
    } else {
      // EXISTING memory → reinforce or decay
      if (approved) {
        approveMemory(memory.id);
      } else {
        rejectMemory(memory.id);
      }
    }
  }
}
