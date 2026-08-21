export interface InventoryItem {
  id?: string;
  kode: string;
  sku: string;
  deskripsi: string;
  // Fallback for other data if columns have more
  rawData: string[];
}
