export function applyHumanCorrection(
  vendor: string,
  invoiceNumber: string,
  corrections: Record<string, any>,
  approved: boolean
) {
  // 1. Save corrections into memory
  // 2. Increase confidence if approved
  // 3. Decrease confidence if rejected
}
