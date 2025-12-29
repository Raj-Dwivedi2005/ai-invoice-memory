export interface LineItem {
  sku?: string;
  description?: string;
  qty: number;
  unitPrice: number;
}

export interface NormalizedInvoice {
  invoiceNumber: string;
  invoiceDate: string;
  serviceDate?: string | null;
  currency?: string;
  netTotal: number;
  taxRate: number;
  taxTotal: number;
  grossTotal: number;
  lineItems: LineItem[];
  poNumber?: string;
  rawText?: string;
}

export interface Invoice {
  invoiceId: string;
  vendor: string;
  fields: NormalizedInvoice;
}

export interface MemoryEntry {
  vendor: string;
  field: string;
  value: any;
  confidence: number;
  invoiceNumber?: string;
}
