export interface InventoryItem {
  kode: string;
  sku: string;
  deskripsi: string;
  // Fallback for other data if columns have more
  rawData: string[];
}
