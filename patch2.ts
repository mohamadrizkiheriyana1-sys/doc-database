import { readFileSync, writeFileSync } from 'fs';

const path = 'src/components/InventoryDashboard.tsx';
let content = readFileSync(path, 'utf-8');

const oldTable = `                  <table className="w-full border-collapse text-left min-w-[600px]">
                    <thead className="sticky top-0 bg-[#111113] z-10">
                      <tr>
                        <th className="text-[0.6rem] uppercase opacity-50 p-[10px] border-b border-[rgba(236,236,236,0.1)] w-[20%]">KODE</th>
                        <th className="text-[0.6rem] uppercase opacity-50 p-[10px] border-b border-[rgba(236,236,236,0.1)] w-[20%]">SKU ID</th>
                        <th className="text-[0.6rem] uppercase opacity-50 p-[10px] border-b border-[rgba(236,236,236,0.1)] w-[60%]">DESKRIPSI</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.length > 0 ? (
                        filteredData.map((item, index) => (
                          <tr key={index}>
                            <td className="p-[15px_10px] text-[0.85rem] border-b border-white/5 text-[#00f2ff]">
                              {item.kode}
                            </td>
                            <td className="p-[15px_10px] text-[0.85rem] border-b border-white/5 text-[#ececec]">
                              {item.sku}
                            </td>
                            <td className="p-[15px_10px] text-[0.85rem] border-b border-white/5 text-[#ececec]">
                              {item.deskripsi}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="p-[30px_10px] text-center border-b border-white/5">`;

const newTable = `                  <table className="w-full border-collapse text-left min-w-[600px]">
                    <thead className="sticky top-0 bg-[#111113] z-10">
                      <tr>
                        <th className="text-[0.6rem] uppercase opacity-50 p-[10px] border-b border-[rgba(236,236,236,0.1)] w-[20%]">KODE</th>
                        <th className="text-[0.6rem] uppercase opacity-50 p-[10px] border-b border-[rgba(236,236,236,0.1)] w-[20%]">SKU ID</th>
                        <th className="text-[0.6rem] uppercase opacity-50 p-[10px] border-b border-[rgba(236,236,236,0.1)] w-[50%]">DESKRIPSI</th>
                        <th className="text-[0.6rem] uppercase opacity-50 p-[10px] border-b border-[rgba(236,236,236,0.1)] w-[10%] text-right">AKSI</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.length > 0 ? (
                        filteredData.map((item, index) => {
                          const isEditing = editingItem === item.id && item.id;
                          return (
                          <tr key={item.id || index}>
                            <td className="p-[15px_10px] text-[0.85rem] border-b border-white/5 text-[#00f2ff]">
                              {isEditing ? (
                                <input value={editKode} onChange={e => setEditKode(e.target.value)} className="bg-black/50 border border-[#00f2ff]/30 p-2 w-full text-[#00f2ff] outline-none" />
                              ) : item.kode}
                            </td>
                            <td className="p-[15px_10px] text-[0.85rem] border-b border-white/5 text-[#ececec]">
                              {isEditing ? (
                                <input value={editSku} onChange={e => setEditSku(e.target.value)} className="bg-black/50 border border-[rgba(236,236,236,0.3)] p-2 w-full text-white outline-none" />
                              ) : item.sku}
                            </td>
                            <td className="p-[15px_10px] text-[0.85rem] border-b border-white/5 text-[#ececec]">
                              {isEditing ? (
                                <input value={editDeskripsi} onChange={e => setEditDeskripsi(e.target.value)} className="bg-black/50 border border-[rgba(236,236,236,0.3)] p-2 w-full text-white outline-none" />
                              ) : item.deskripsi}
                            </td>
                            <td className="p-[15px_10px] text-[0.85rem] border-b border-white/5 text-right align-middle">
                              {isEditing ? (
                                <div className="flex justify-end gap-3 items-center h-full">
                                  <button onClick={handleSaveEdit} className="text-[#00f2ff] hover:text-white transition-colors text-[0.6rem] uppercase font-bold tracking-widest">Save</button>
                                  <button onClick={handleCancelEdit} className="text-[#ececec]/50 hover:text-white transition-colors text-[0.6rem] uppercase font-bold tracking-widest">Cancel</button>
                                </div>
                              ) : (
                                <div className="flex justify-end gap-3 items-center h-full">
                                  {item.id ? (
                                    <>
                                      <button onClick={() => handleEditClick(item)} className="text-[#ececec]/50 hover:text-[#00f2ff] transition-colors" title="Edit Data"><Edit2 className="w-4 h-4" /></button>
                                      <button onClick={() => handleDelete(item.id)} className="text-[#ececec]/50 hover:text-red-500 transition-colors" title="Hapus Data"><Trash2 className="w-4 h-4" /></button>
                                    </>
                                  ) : (
                                    <span className="text-[#ececec]/20 text-[0.55rem] uppercase tracking-widest" title="Sinkronisasi Google Sheets (Hanya Baca)">G-Sheets</span>
                                  )}
                                </div>
                              )}
                            </td>
                          </tr>
                        )})
                      ) : (
                        <tr>
                          <td colSpan={4} className="p-[30px_10px] text-center border-b border-white/5">`;

content = content.replace(oldTable, newTable);
writeFileSync(path, content);
