import * as XLSX from 'xlsx';
import type { LeadRecord } from './leadFilters';

const formatDate = (value?: string) => {
  if (!value) return '';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
};

export const leadToExportRow = (lead: LeadRecord) => {
  const qf = lead.quotationFor ?? {};
  return {
    'Lead ID': lead._id,
    'Product Name': lead.productName ?? '',
    'Requester Email': lead.requesterEmail ?? '',
    'Contact Number': lead.contactNumber ?? '',
    Quantity: lead.quantity ?? '',
    'Quantity Requested': lead.quantityRequested ?? '',
    Status: lead.status ?? '',
    'Assigned To': lead.assignedTo ?? '',
    'Assigned Employee': lead.assignedEmployee ?? '',
    'Company': qf.company ?? '',
    'Contact Name': qf.name ?? '',
    Location: qf.location ?? '',
    'Kind Attn': qf.kindAttn ?? '',
    'Quotation Phone': qf.phone ?? '',
    'Quotation Email': qf.email ?? '',
    Reference: qf.reference ?? '',
    Items: lead.items?.map((i) => `${i.product} (${i.quantity})`).join('; ') ?? '',
    'Has Quotation': lead.quotation ? 'Yes' : 'No',
    Comments:
      lead.comments
        ?.map((c) => `[${c.authorType ?? ''}] ${c.comment ?? ''} (${formatDate(c.createdAt)})`)
        .join(' | ') ?? '',
    'Created At': formatDate(lead.createdAt),
    'Updated At': formatDate(lead.updatedAt),
  };
};

export const exportLeadsToExcel = (leads: LeadRecord[], filename?: string) => {
  const rows = leads.map(leadToExportRow);
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads');
  const stamp = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, filename ?? `truetorq-leads-${stamp}.xlsx`);
};
