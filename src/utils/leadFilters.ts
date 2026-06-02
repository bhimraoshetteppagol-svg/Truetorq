export interface QuotationFor {
  company?: string;
  name?: string;
  location?: string;
  kindAttn?: string;
  phone?: string;
  email?: string;
  reference?: string;
}

export interface LeadItem {
  product?: string;
  quantity?: number;
}

export interface LeadComment {
  comment?: string;
  authorType?: string;
  createdAt?: string;
}

export interface LeadRecord {
  _id: string;
  productName?: string;
  requesterEmail?: string;
  contactNumber?: string;
  quantity?: number;
  quantityRequested?: number;
  status?: string;
  assignedTo?: string;
  assignedEmployee?: string;
  createdAt?: string;
  updatedAt?: string;
  quotation?: unknown;
  quotationFor?: QuotationFor;
  items?: LeadItem[];
  comments?: LeadComment[];
}

export interface LeadFilters {
  search: string;
  status: string;
  productName: string;
  requesterEmail: string;
  contactNumber: string;
  assignedTo: string;
  createdFrom: string;
  createdTo: string;
  kindAttn: string;
  reference: string;
  hasQuotation: '' | 'yes' | 'no';
}

export const emptyLeadFilters = (): LeadFilters => ({
  search: '',
  status: '',
  productName: '',
  requesterEmail: '',
  contactNumber: '',
  assignedTo: '',
  createdFrom: '',
  createdTo: '',
  kindAttn: '',
  reference: '',
  hasQuotation: '',
});

const includes = (value: string | undefined, query: string) =>
  (value ?? '').toLowerCase().includes(query.toLowerCase());

const leadSearchBlob = (lead: LeadRecord): string => {
  const qf = lead.quotationFor ?? {};
  const parts = [
    lead._id,
    lead.productName,
    lead.requesterEmail,
    lead.contactNumber,
    lead.status,
    lead.assignedTo,
    lead.assignedEmployee,
    String(lead.quantity ?? ''),
    String(lead.quantityRequested ?? ''),
    qf.company,
    qf.name,
    qf.location,
    qf.kindAttn,
    qf.phone,
    qf.email,
    qf.reference,
    lead.items?.map((i) => `${i.product} x${i.quantity}`).join(' '),
    lead.comments?.map((c) => c.comment).join(' '),
    lead.quotation ? 'quotation' : '',
  ];
  return parts.filter(Boolean).join(' ').toLowerCase();
};

export const applyLeadFilters = (leads: LeadRecord[], filters: LeadFilters): LeadRecord[] => {
  return leads.filter((lead) => {
    if (filters.search.trim() && !leadSearchBlob(lead).includes(filters.search.trim().toLowerCase())) {
      return false;
    }
    if (filters.status && lead.status !== filters.status) return false;
    if (filters.productName && !includes(lead.productName, filters.productName)) return false;
    if (filters.requesterEmail && !includes(lead.requesterEmail, filters.requesterEmail)) return false;
    if (filters.contactNumber && !includes(lead.contactNumber, filters.contactNumber)) return false;
    if (filters.assignedTo) {
      const assignee = `${lead.assignedTo ?? ''} ${lead.assignedEmployee ?? ''}`;
      if (!includes(assignee, filters.assignedTo)) return false;
    }
    if (filters.kindAttn && !includes(lead.quotationFor?.kindAttn, filters.kindAttn)) return false;
    if (filters.reference && !includes(lead.quotationFor?.reference, filters.reference)) return false;

    if (filters.hasQuotation === 'yes' && !lead.quotation) return false;
    if (filters.hasQuotation === 'no' && lead.quotation) return false;

    if (filters.createdFrom && lead.createdAt) {
      if (new Date(lead.createdAt) < new Date(filters.createdFrom)) return false;
    }
    if (filters.createdTo && lead.createdAt) {
      const to = new Date(filters.createdTo);
      to.setHours(23, 59, 59, 999);
      if (new Date(lead.createdAt) > to) return false;
    }

    return true;
  });
};

export const hasActiveLeadFilters = (filters: LeadFilters): boolean =>
  Object.entries(filters).some(([, value]) => String(value).trim() !== '');
