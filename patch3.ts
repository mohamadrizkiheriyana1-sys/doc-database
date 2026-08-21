import { readFileSync, writeFileSync } from 'fs';

const path = 'src/components/InventoryDashboard.tsx';
let content = readFileSync(path, 'utf-8');

const oldHandleDelete = `  const handleDelete = async (id: string | undefined) => {
    if (!id) {
      alert("Hanya data yang ditambahkan secara lokal (bukan dari Google Sheets) yang dapat dihapus.");
      return;
    }
    if (window.confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      try {
        await deleteDoc(doc(db, 'parts', id));
      } catch (err) {
        console.error(err);
        alert('Gagal menghapus record');
      }
    }
  };`;

const newHandleDelete = `  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    try {
      await deleteDoc(doc(db, 'parts', id));
    } catch (err) {
      console.error(err);
    }
  };`;

content = content.replace(oldHandleDelete, newHandleDelete);
writeFileSync(path, content);
