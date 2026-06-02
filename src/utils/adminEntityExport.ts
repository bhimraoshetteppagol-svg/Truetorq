import * as XLSX from 'xlsx';
import type { AccountRecord, ProductRecord } from './adminEntityFilters';

const getProductName = (p: ProductRecord) => p.productName || p.name || '';
const getProductDescription = (p: ProductRecord) => p.productDescription || p.description || '';

const writeExcel = (rows: Record<string, unknown>[], sheetName: string, filename: string) => {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, filename);
};

const stamp = () => new Date().toISOString().slice(0, 10);

export const exportAccountsToExcel = (
  items: AccountRecord[],
  kind: 'users' | 'employees',
  filename?: string
) => {
  const rows = items.map((item) => ({
    ID: item._id,
    Name: item.name ?? '',
    Email: item.email ?? '',
    Role: item.role ?? '',
  }));
  writeExcel(rows, kind === 'users' ? 'Users' : 'Employees', filename ?? `truetorq-${kind}-${stamp()}.xlsx`);
};

export const exportProductsToExcel = (items: ProductRecord[], filename?: string) => {
  const rows = items.map((item) => ({
    ID: item._id,
    'Product Name': getProductName(item),
    Category: item.category ?? '',
    Price: item.price ?? '',
    Description: getProductDescription(item),
  }));
  writeExcel(rows, 'Products', filename ?? `truetorq-products-${stamp()}.xlsx`);
};
