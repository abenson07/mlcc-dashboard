export type InvoiceStatus = "Overdue" | "Active" | "Paid";

export interface Invoice {
  id: number;
  dueDate: string;
  dueRel: string;
  status: InvoiceStatus;
  customer: string;
  email: string;
  amount: string;
  cents: string;
  invoiceNo: string;
  invoiceDate: string;
  type: string;
  sentTo: string;
  createdBy: string;
  createdDate: string;
  autoReminders: string;
  recurring: string;
}
