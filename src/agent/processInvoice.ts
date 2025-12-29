import referenceData from '../data/reference_data.json';
import { MemoryEntry, Invoice, NormalizedInvoice } from './types';

const memoryStore: Record<string, MemoryEntry[]> = {};

export function processInvoice(invoice: Invoice) {
  const vendor = invoice.vendor;
  const memoryEntries = memoryStore[vendor] || [];

  let proposedCorrections: string[] = [];
  let requiresHumanReview = false;
  let reasoning = '';
  let confidenceScore = 0;
  let memoryUpdates: string[] = [];

  // --- Normalize invoice fields ---
  const normalizedInvoice: NormalizedInvoice = { ...invoice.fields };

  // --- Apply learned vendor rules ---
  if (vendor === 'Supplier GmbH') {
    // Auto-fill serviceDate if learned
    const serviceDateEntry = memoryEntries.find(m => m.field === 'serviceDate');
    if (serviceDateEntry && !normalizedInvoice.serviceDate) {
      normalizedInvoice.serviceDate = serviceDateEntry.value;
      proposedCorrections.push(`Filled serviceDate using learned vendor memory (Supplier GmbH)`);
      memoryUpdates.push(`Filled serviceDate using learned vendor memory (Supplier GmbH)`);
      reasoning = 'Applied high-confidence learned memory / vendor rules';
      confidenceScore = serviceDateEntry.confidence;
    }

    // Auto-suggest PO if single matching PO exists
    if (!normalizedInvoice.poNumber) {
      const poMatch = referenceData.purchaseOrders.find(
        (po: any) =>
          po.vendor === vendor &&
          po.lineItems.some((item: any) =>
            invoice.fields.lineItems.some(
              (invItem: any) => invItem.sku === item.sku
            )
          )
      );

      if (poMatch) {
        normalizedInvoice.poNumber = poMatch.poNumber;
        proposedCorrections.push(`Auto-suggested PO ${poMatch.poNumber} for invoice ${normalizedInvoice.invoiceNumber}`);
        memoryUpdates.push(`Auto-suggested PO ${poMatch.poNumber} for invoice ${normalizedInvoice.invoiceNumber}`);
        reasoning = 'Applied high-confidence learned memory / vendor rules';
        confidenceScore = 0;
      }
    }
  }

  if (vendor === 'Parts AG') {
    // Detect VAT-inclusive pricing
    if (invoice.fields.rawText?.includes('inkl') || invoice.fields.rawText?.includes('incl. VAT')) {
      normalizedInvoice.netTotal = normalizedInvoice.grossTotal / (1 + normalizedInvoice.taxRate);
      normalizedInvoice.taxTotal = normalizedInvoice.grossTotal - normalizedInvoice.netTotal;
      proposedCorrections.push('Recomputed tax and net totals because prices include VAT (Parts AG)');
      memoryUpdates.push('Recomputed tax and net totals because prices include VAT (Parts AG)');
      reasoning = 'Applied high-confidence learned memory / vendor rules';
      confidenceScore = 0;
    }

    // Recover missing currency
    if (!normalizedInvoice.currency && invoice.fields.rawText?.includes('Currency')) {
      const currencyMatch = invoice.fields.rawText.match(/Currency:\s*(\w+)/);
      if (currencyMatch) {
        normalizedInvoice.currency = currencyMatch[1];
        proposedCorrections.push(`Recovered missing currency (${currencyMatch[1]}) from rawText`);
        memoryUpdates.push(`Recovered missing currency (${currencyMatch[1]}) from rawText`);
        reasoning = 'Applied high-confidence learned memory / vendor rules';
        confidenceScore = 0;
      }
    }
  }

  if (vendor === 'Freight & Co') {
    // Skonto detection
    if (invoice.fields.rawText?.toLowerCase().includes('skonto')) {
      const skontoMatch = invoice.fields.rawText.match(/Skonto\s*(\d+)%/i);
      if (skontoMatch) {
        memoryUpdates.push(`Detected Skonto ${skontoMatch[1]}% for vendor Freight & Co`);
      }
    }

    // Map descriptions to SKU FREIGHT
    normalizedInvoice.lineItems.forEach(item => {
      if (item.description?.toLowerCase().includes('seefracht') || item.description?.toLowerCase().includes('shipping')) {
        item.sku = 'FREIGHT';
        proposedCorrections.push('Mapped description to SKU FREIGHT (Freight & Co)');
        memoryUpdates.push('Mapped description to SKU FREIGHT (Freight & Co)');
        confidenceScore = 0.7;
      }
    });
  }

  // --- Duplicate detection ---
  const duplicate = memoryEntries.find(m => m.invoiceNumber === normalizedInvoice.invoiceNumber);
  if (duplicate) {
    requiresHumanReview = true;
    reasoning = 'Duplicate invoice detected based on vendor and invoice number';
    confidenceScore = 0;
    proposedCorrections = [];
    memoryUpdates = [];
  }

  // --- Store memory updates ---
  if (!memoryStore[vendor]) memoryStore[vendor] = [];
  memoryUpdates.forEach(update =>
    memoryStore[vendor].push({
      vendor, 
      field: 'generic',
      value: update,
      confidence: confidenceScore,
      invoiceNumber: normalizedInvoice.invoiceNumber
    })
  );


  return {
    normalizedInvoice,
    proposedCorrections,
    requiresHumanReview,
    reasoning,
    confidenceScore,
    memoryUpdates,
    auditTrail: [
      { step: 'recall', timestamp: new Date().toISOString(), details: `Loaded ${memoryEntries.length} memory entries for vendor ${vendor}` },
      { step: 'apply', timestamp: new Date().toISOString(), details: memoryUpdates.join('; ') || 'No auto-corrections applied' },
      { step: 'decide', timestamp: new Date().toISOString(), details: requiresHumanReview ? 'Escalated due to duplicates or low-confidence' : 'Auto-approved using high-confidence memory' },
      { step: 'learn', timestamp: new Date().toISOString(), details: `Marked invoice ${normalizedInvoice.invoiceNumber} as processed` }
    ]
  };
}

