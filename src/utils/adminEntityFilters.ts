export interface AccountRecord {
  _id: string;
  email?: string;
  role?: string;
  name?: string;
}

export interface AccountFilters {
  search: string;
  email: string;
  role: string;
}

export const emptyAccountFilters = (): AccountFilters => ({
  search: '',
  email: '',
  role: '',
});

export interface ProductRecord {
  _id: string;
  name?: string;
  productName?: string;
  description?: string;
  productDescription?: string;
  price?: number;
  category?: string;
}

export interface ProductFilters {
  search: string;
  name: string;
  category: string;
  priceMin: string;
  priceMax: string;
}

export const emptyProductFilters = (): ProductFilters => ({
  search: '',
  name: '',
  category: '',
  priceMin: '',
  priceMax: '',
});

const includes = (value: string | undefined, query: string) =>
  (value ?? '').toLowerCase().includes(query.toLowerCase());

export const hasActiveFilters = (filters: Record<string, string>) =>
  Object.values(filters).some((value) => String(value).trim() !== '');

const accountBlob = (item: AccountRecord) =>
  [item._id, item.email, item.role, item.name].filter(Boolean).join(' ').toLowerCase();

export const applyAccountFilters = (items: AccountRecord[], filters: AccountFilters) =>
  items.filter((item) => {
    if (filters.search.trim() && !accountBlob(item).includes(filters.search.trim().toLowerCase())) {
      return false;
    }
    if (filters.email && !includes(item.email, filters.email)) return false;
    if (filters.role && item.role !== filters.role) return false;
    return true;
  });

const productName = (p: ProductRecord) => p.productName || p.name || '';
const productDescription = (p: ProductRecord) => p.productDescription || p.description || '';

const productBlob = (item: ProductRecord) =>
  [
    item._id,
    productName(item),
    productDescription(item),
    item.category,
    String(item.price ?? ''),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

export const applyProductFilters = (items: ProductRecord[], filters: ProductFilters) =>
  items.filter((item) => {
    if (filters.search.trim() && !productBlob(item).includes(filters.search.trim().toLowerCase())) {
      return false;
    }
    if (filters.name && !includes(productName(item), filters.name)) return false;
    if (filters.category && (item.category ?? '') !== filters.category) return false;

    const price = Number(item.price ?? 0);
    if (filters.priceMin && price < Number(filters.priceMin)) return false;
    if (filters.priceMax && price > Number(filters.priceMax)) return false;

    return true;
  });
