import { readFileSync, writeFileSync } from 'fs';

const path = 'src/components/InventoryDashboard.tsx';
let content = readFileSync(path, 'utf-8');

// 1. Update activeView state
content = content.replace(
  "const [activeView, setActiveView] = useState<'inventory' | 'add' | 'request' | 'owner'>('inventory');",
  "const [activeView, setActiveView] = useState<'inventory' | 'add' | 'request' | 'owner' | 'audit'>('inventory');"
);
content = content.replace(
  "const [activeSessions, setActiveSessions] = useState<any[]>([]);",
  "const [activeSessions, setActiveSessions] = useState<any[]>([]);\n  const [auditLogs, setAuditLogs] = useState<any[]>([]);"
);

// 2. Add addAuditLog helper function
const addAuditLogFunc = `
  const addAuditLog = async (action: 'ADD' | 'EDIT' | 'DELETE', details: string, itemData: any) => {
    try {
      await addDoc(collection(db, 'audit_logs'), {
        action,
        details,
        itemData,
        timestamp: new Date().toISOString(),
        user: auth.currentUser?.email || 'Unknown User'
      });
    } catch (error) {
      console.error("Failed to add audit log", error);
    }
  };
`;
// find a place to put it. e.g., before handleAddPart
content = content.replace(
  "  const handleAddPart = async (e: React.FormEvent) => {",
  addAuditLogFunc + "\n  const handleAddPart = async (e: React.FormEvent) => {"
);

// 3. Inject into handleAddPart
const oldAddPartSuccess = `      setAddStatus({ type: 'success', message: 'RECORD_ADDED_SUCCESSFULLY' });
    } catch (err) {`;
const newAddPartSuccess = `      await addAuditLog('ADD', \`Added new item: \${newSku.trim()}\`, { kode: newKode.trim(), sku: newSku.trim(), deskripsi: newDeskripsi.trim() });
      setAddStatus({ type: 'success', message: 'RECORD_ADDED_SUCCESSFULLY' });
    } catch (err) {`;
content = content.replace(oldAddPartSuccess, newAddPartSuccess);

// 4. Inject into handleSaveEdit
const oldSaveEditSuccess = `      await updateDoc(doc(db, 'parts', editingItem), {
        kode: editKode.trim(),
        sku: editSku.trim(),
        deskripsi: editDeskripsi.trim()
      });
      setEditingItem(null);
    } catch (err) {`;
const newSaveEditSuccess = `      await updateDoc(doc(db, 'parts', editingItem), {
        kode: editKode.trim(),
        sku: editSku.trim(),
        deskripsi: editDeskripsi.trim()
      });
      await addAuditLog('EDIT', \`Edited item: \${editSku.trim()}\`, { id: editingItem, kode: editKode.trim(), sku: editSku.trim(), deskripsi: editDeskripsi.trim() });
      setEditingItem(null);
    } catch (err) {`;
content = content.replace(oldSaveEditSuccess, newSaveEditSuccess);

// 5. Inject into handleDelete
const oldDeleteSuccess = `    try {
      await deleteDoc(doc(db, 'parts', id));
    } catch (err) {`;
const newDeleteSuccess = `    try {
      const itemToDelete = localData.find(i => i.id === id);
      await deleteDoc(doc(db, 'parts', id));
      if (itemToDelete) {
        await addAuditLog('DELETE', \`Deleted item: \${itemToDelete.sku}\`, itemToDelete);
      }
    } catch (err) {`;
content = content.replace(oldDeleteSuccess, newDeleteSuccess);

// 6. Add useEffect listener for audit_logs
const oldUseEffect = `    // Listen to requests from Firestore
    const qRequests = query(collection(db, 'requests'), orderBy('date', 'desc'));
    const unsubRequests = onSnapshot(qRequests, (snapshot) => {
      const reqs: any[] = [];
      snapshot.forEach(doc => {
        reqs.push({ id: doc.id, ...doc.data() });
      });
      if (mounted) setRequestHistory(reqs);
    });`;
const newUseEffect = oldUseEffect + `

    // Listen to audit logs
    const qAudit = query(collection(db, 'audit_logs'), orderBy('timestamp', 'desc'), limit(100));
    const unsubAudit = onSnapshot(qAudit, (snapshot) => {
      const logs: any[] = [];
      snapshot.forEach(doc => {
        logs.push({ id: doc.id, ...doc.data() });
      });
      if (mounted) setAuditLogs(logs);
    });`;
content = content.replace(oldUseEffect, newUseEffect);

// 7. Unsubscribe audit logs
content = content.replace(
  "unsubRequests();\n      mounted = false;",
  "unsubRequests();\n      unsubAudit();\n      mounted = false;"
);

// 8. Add Audit Log to Sidebar
const sidebarAuditLog = `            <button 
              onClick={() => setActiveView('owner')}
              className={\`text-left px-4 py-3 md:px-10 md:py-[15px] text-[0.7rem] uppercase border-b-2 md:border-b-0 md:border-l-2 cursor-pointer transition-all \${activeView === 'owner' ? 'border-[#00f2ff] opacity-100 text-[#00f2ff]' : 'border-transparent opacity-60'}\`}
            >
              04. Owner
            </button>
            <button 
              onClick={() => setActiveView('audit')}
              className={\`text-left px-4 py-3 md:px-10 md:py-[15px] text-[0.7rem] uppercase border-b-2 md:border-b-0 md:border-l-2 cursor-pointer transition-all \${activeView === 'audit' ? 'border-[#00f2ff] opacity-100 text-[#00f2ff]' : 'border-transparent opacity-60'}\`}
            >
              05. Audit Log
            </button>`;
content = content.replace(
  /<button \n\s*onClick=\{\(\) => setActiveView\('owner'\)\}[\s\S]*?<\/button>/,
  sidebarAuditLog
);

// 9. Add Audit View UI
const ownerView = `          ) : activeView === 'owner' ? (`;
const auditView = `          ) : activeView === 'audit' ? (
            <div className="flex-1 md:overflow-y-auto flex flex-col pt-4 md:pt-10">
              <h2 className="text-xl md:text-2xl font-['Syne'] text-[#00f2ff] mb-2 uppercase tracking-[-0.02em]">AUDIT_LOG</h2>
              <p className="text-[#ececec]/40 text-[10px] uppercase tracking-[0.2em] mb-6 md:mb-8 border-b border-[rgba(236,236,236,0.1)] pb-4">
                SYSTEM_MODIFICATION_RECORDS
              </p>
              
              <div className="w-full bg-black/20 border border-[rgba(236,236,236,0.1)] p-4 overflow-auto">
                {auditLogs.length > 0 ? (
                  <table className="w-full border-collapse text-left min-w-[600px]">
                    <thead className="sticky top-0 bg-[#111113] z-10">
                      <tr>
                        <th className="text-[0.6rem] uppercase opacity-50 p-[10px] border-b border-[rgba(236,236,236,0.1)]">WAKTU</th>
                        <th className="text-[0.6rem] uppercase opacity-50 p-[10px] border-b border-[rgba(236,236,236,0.1)]">USER</th>
                        <th className="text-[0.6rem] uppercase opacity-50 p-[10px] border-b border-[rgba(236,236,236,0.1)]">AKSI</th>
                        <th className="text-[0.6rem] uppercase opacity-50 p-[10px] border-b border-[rgba(236,236,236,0.1)]">DETAIL</th>
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence initial={false}>
                        {auditLogs.map((log) => (
                          <motion.tr 
                            key={log.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="border-b border-white/5"
                          >
                            <td className="p-[10px] text-xs text-[#ececec]/60 whitespace-nowrap">
                              {new Date(log.timestamp).toLocaleString('id-ID')}
                            </td>
                            <td className="p-[10px] text-xs text-[#00f2ff]">
                              {log.user}
                            </td>
                            <td className="p-[10px]">
                              <span className={\`text-[0.6rem] uppercase tracking-widest px-2 py-1 \${log.action === 'ADD' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : log.action === 'EDIT' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}\`}>
                                {log.action}
                              </span>
                            </td>
                            <td className="p-[10px] text-xs text-[#ececec]">
                              {log.details}
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                ) : (
                  <div className="flex flex-col items-center py-10">
                    <FileText className="w-8 h-8 text-[#ececec]/20 mb-3" />
                    <p className="text-[#ececec]/40 text-xs uppercase tracking-widest">NO_LOGS_FOUND</p>
                  </div>
                )}
              </div>
            </div>
          ) : activeView === 'owner' ? (`;
content = content.replace(ownerView, auditView);

writeFileSync(path, content);
