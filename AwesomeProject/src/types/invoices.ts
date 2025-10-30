// Invoice-related TypeScript interfaces

export interface Invoice {
  id: string;
  billNo: string;
  period: string;
  fromDate: string;
  toDate: string;
  grandTotal: string;
  url: string;
  generatedAt: string;
}

export interface InvoiceItem {
  date: string;
  products: ProductDetail[];
  total: string;
}

export interface ProductDetail {
  name: string;
  quantity: number;
  price: number;
  itemTotal: number;
}

export interface InvoiceResponse {
  success: boolean;
  message?: string;
  invoices: Invoice[];
  invoice?: Invoice;
}

export interface GenerateInvoiceRequest {
  customerId: string;
  period?: string;
  from?: string;
  to?: string;
}

export interface GenerateInvoiceResponse {
  success: boolean;
  message: string;
  pdf?: {
    url: string;
  };
}

export interface CustomerBillStatus {
  _id: string;
  name: string;
  phone: string;
  Bill: string; // 'Paid', 'Unpaid', 'Pending'
}