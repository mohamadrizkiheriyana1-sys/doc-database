import { readFileSync, writeFileSync } from 'fs';

const path = 'src/components/InventoryDashboard.tsx';
let content = readFileSync(path, 'utf-8');

const stateInjection = `
  // Edit Part states
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editKode, setEditKode] = useState('');
  const [editSku, setEditSku] = useState('');
  const [editDeskripsi, setEditDeskripsi] = useState('');
`;

content = content.replace(
  "  const [addHistory, setAddHistory] = useState<{kode: string, sku: string, time: string}[]>([]);\n",
  "  const [addHistory, setAddHistory] = useState<{kode: string, sku: string, time: string}[]>([]);\n" + stateInjection
);

const handlersInjection = `
  const handleEditClick = (item: InventoryItem) => {
    if (!item.id) {
      alert("Hanya data yang ditambahkan secara lokal (bukan dari Google Sheets) yang dapat diedit.");
      return;
    }
    setEditingItem(item.id);
    setEditKode(item.kode);
    setEditSku(item.sku);
    setEditDeskripsi(item.deskripsi);
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    try {
      await updateDoc(doc(db, 'parts', editingItem), {
        kode: editKode.trim(),
        sku: editSku.trim(),
        deskripsi: editDeskripsi.trim()
      });
      setEditingItem(null);
    } catch (err) {
      console.error(err);
      alert('Gagal mengupdate record');
    }
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
  };

  const handleDelete = async (id: string | undefined) => {
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
  };
`;

content = content.replace(
  "  const handleAddPart = async (e: React.FormEvent) => {",
  handlersInjection + "\n  const handleAddPart = async (e: React.FormEvent) => {"
);

writeFileSync(path, content);
