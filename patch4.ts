import { readFileSync, writeFileSync } from 'fs';

const path = 'src/components/InventoryDashboard.tsx';
let content = readFileSync(path, 'utf-8');

const oldHandleEdit = `  const handleEditClick = (item: InventoryItem) => {
    if (!item.id) {
      alert("Hanya data yang ditambahkan secara lokal (bukan dari Google Sheets) yang dapat diedit.");
      return;
    }
    setEditingItem(item.id);
    setEditKode(item.kode);
    setEditSku(item.sku);
    setEditDeskripsi(item.deskripsi);
  };`;

const newHandleEdit = `  const handleEditClick = (item: InventoryItem) => {
    if (!item.id) return;
    setEditingItem(item.id);
    setEditKode(item.kode);
    setEditSku(item.sku);
    setEditDeskripsi(item.deskripsi);
  };`;

content = content.replace(oldHandleEdit, newHandleEdit);
writeFileSync(path, content);
