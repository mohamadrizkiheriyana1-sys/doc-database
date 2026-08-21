import { readFileSync, writeFileSync } from 'fs';
const path = 'src/components/InventoryDashboard.tsx';
let content = readFileSync(path, 'utf-8');

const targetStr = ") : activeView === 'settings' ? (";
const startIdx = content.indexOf(targetStr);
const endIdx = content.indexOf("</main>", startIdx);

const replacement = `) : activeView === 'settings' ? (
            <div className="flex-1 md:overflow-y-auto flex flex-col pt-4 md:pt-10">
              <h2 className="text-xl md:text-2xl font-['Syne'] text-[var(--accent)] mb-2 uppercase tracking-[-0.02em]">PENGATURAN</h2>
              <p className="text-[var(--text-main)]/40 text-[10px] uppercase tracking-[0.2em] mb-4">
                SYSTEM_PREFERENCES_AND_SECURITY
              </p>

              {/* Tabs */}
              <div className="flex gap-2 border-b border-[var(--border-10)] mb-6 md:mb-8 pb-px">
                <button 
                  onClick={() => setSettingsTab('profile')}
                  className={\`text-[0.65rem] uppercase tracking-widest px-4 py-2 border-b-2 transition-all \${settingsTab === 'profile' ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-transparent opacity-50 hover:opacity-100'}\`}
                >
                  Profil & Keamanan
                </button>
                <button 
                  onClick={() => setSettingsTab('owner')}
                  className={\`text-[0.65rem] uppercase tracking-widest px-4 py-2 border-b-2 transition-all \${settingsTab === 'owner' ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-transparent opacity-50 hover:opacity-100'}\`}
                >
                  Owner Panel
                </button>
                <button 
                  onClick={() => setSettingsTab('audit')}
                  className={\`text-[0.65rem] uppercase tracking-widest px-4 py-2 border-b-2 transition-all \${settingsTab === 'audit' ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-transparent opacity-50 hover:opacity-100'}\`}
                >
                  Audit Log
                </button>
              </div>

              {settingsTab === 'profile' ? (
                <>
                  {settingsStatus && (
                    <div className={\`p-4 mb-6 text-xs uppercase tracking-widest border \${settingsStatus.type === 'success' ? 'bg-[var(--accent)]/10 border-[var(--accent)]/30 text-[var(--accent)]' : 'bg-red-500/10 border-red-500/30 text-red-500'}\`}>
                      {settingsStatus.msg}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                    {/* Profil Pemilik */}
                    <form onSubmit={handleSaveProfile} className="bg-[var(--overlay-20)] border border-[var(--border-10)] p-6 flex flex-col gap-6">
                      <div className="flex items-center gap-3 border-b border-[var(--border-10)] pb-4">
                        <UserCircle className="w-5 h-5 text-[var(--accent)]" />
                        <h3 className="text-sm tracking-widest uppercase">Profil Sistem</h3>
                      </div>
                      
                      <div className="flex flex-col gap-4">
                        <div>
                          <label className="block text-[0.6rem] uppercase text-[var(--text-main)]/60 mb-2 tracking-widest">Nama Aplikasi</label>
                          <input 
                            type="text" 
                            value={settingsApp}
                            onChange={(e) => setSettingsApp(e.target.value)}
                            required
                            className="w-full bg-[var(--overlay-30)] border border-[var(--border-10)] p-3 text-[var(--text-main)] outline-none focus:border-[var(--accent)]/50 transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-[0.6rem] uppercase text-[var(--text-main)]/60 mb-2 tracking-widest">Nama Pemilik / Admin</label>
                          <input 
                            type="text" 
                            value={settingsName}
                            onChange={(e) => setSettingsName(e.target.value)}
                            required
                            className="w-full bg-[var(--overlay-30)] border border-[var(--border-10)] p-3 text-[var(--text-main)] outline-none focus:border-[var(--accent)]/50 transition-colors"
                          />
                        </div>
                      </div>

                      <button 
                        type="submit"
                        className="mt-auto bg-[var(--bg-main)] hover:bg-[var(--accent)] hover:text-black text-[var(--text-main)] border border-[var(--border-20)] hover:border-[var(--accent)] px-4 py-3 text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        SIMPAN PROFIL
                      </button>
                    </form>

                    {/* Keamanan */}
                    <div className="bg-[var(--overlay-20)] border border-[var(--border-10)] p-6 flex flex-col gap-6">
                      <div className="flex items-center gap-3 border-b border-[var(--border-10)] pb-4">
                        <Key className="w-5 h-5 text-yellow-500" />
                        <h3 className="text-sm tracking-widest uppercase">Keamanan Akun</h3>
                      </div>
                      
                      <div className="flex flex-col gap-4">
                        <div>
                          <label className="block text-[0.6rem] uppercase text-[var(--text-main)]/60 mb-2 tracking-widest">Email Terdaftar</label>
                          <div className="w-full bg-[var(--overlay-50)] border border-[var(--border-05)] p-3 text-[var(--text-main)]/60 text-sm opacity-70 cursor-not-allowed">
                            {auth.currentUser?.email || 'Tidak ada sesi aktif'}
                          </div>
                          <p className="text-[0.55rem] text-[var(--text-main)]/40 mt-2 uppercase">Email terhubung dengan Google Auth.</p>
                        </div>
                      </div>

                      <div className="mt-auto pt-4 flex flex-col gap-2 border-t border-[var(--border-10)]">
                        <p className="text-[0.6rem] text-[var(--text-main)]/60 leading-relaxed">
                          Sistem akan mengirimkan tautan penyetelan ulang sandi (Password Reset) ke alamat email Anda. Ikuti instruksi di email tersebut untuk mengubah sandi.
                        </p>
                        <button 
                          onClick={handleResetPassword}
                          type="button"
                          className="bg-[var(--bg-main)] hover:bg-yellow-500 hover:text-black text-yellow-500 border border-yellow-500/30 px-4 py-3 text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 mt-2"
                        >
                          KIRIM LINK UBAH PASSWORD
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : settingsTab === 'audit' ? (
                <>
                  <div className="w-full bg-[var(--overlay-20)] border border-[var(--border-10)] p-4 overflow-auto">
                    {auditLogs.length > 0 ? (
                      <table className="w-full border-collapse text-left min-w-[600px]">
                        <thead className="sticky top-0 bg-[var(--bg-main)] z-10">
                          <tr>
                            <th className="text-[0.6rem] uppercase opacity-50 p-[10px] border-b border-[var(--border-10)]">WAKTU</th>
                            <th className="text-[0.6rem] uppercase opacity-50 p-[10px] border-b border-[var(--border-10)]">USER</th>
                            <th className="text-[0.6rem] uppercase opacity-50 p-[10px] border-b border-[var(--border-10)]">AKSI</th>
                            <th className="text-[0.6rem] uppercase opacity-50 p-[10px] border-b border-[var(--border-10)]">DETAIL</th>
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
                                <td className="p-[10px] text-xs text-[var(--text-main)]/60 whitespace-nowrap">
                                  {new Date(log.timestamp).toLocaleString('id-ID')}
                                </td>
                                <td className="p-[10px] text-xs text-[var(--accent)]">
                                  {log.user}
                                </td>
                                <td className="p-[10px]">
                                  <span className={\`text-[0.6rem] uppercase tracking-widest px-2 py-1 \${log.action === 'ADD' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : log.action === 'EDIT' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}\`}>
                                    {log.action}
                                  </span>
                                </td>
                                <td className="p-[10px] text-xs text-[var(--text-main)]">
                                  {log.details}
                                </td>
                              </motion.tr>
                            ))}
                          </AnimatePresence>
                        </tbody>
                      </table>
                    ) : (
                      <div className="flex flex-col items-center py-10">
                        <FileText className="w-8 h-8 text-[var(--text-main)]/20 mb-3" />
                        <p className="text-[var(--text-main)]/40 text-xs uppercase tracking-widest">NO_LOGS_FOUND</p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex justify-center items-start">
                  <div className="w-full max-w-4xl bg-[var(--overlay-20)] border border-[var(--border-10)] p-6 md:p-8">
                    <h2 className="text-xl md:text-2xl font-['Syne'] text-[var(--accent)] mb-2 uppercase tracking-[-0.02em]">OWNER_CONTROL_PANEL</h2>
                    <p className="text-[var(--text-main)]/40 text-[10px] uppercase tracking-[0.2em] mb-8 border-b border-[var(--border-10)] pb-4">
                      SYSTEM_ADMINISTRATOR_ACCESS
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="border border-[var(--border-10)] p-6 bg-[var(--overlay-30)]">
                        <h3 className="text-[var(--accent)] text-[0.7rem] uppercase tracking-widest mb-4">SYSTEM_STATUS</h3>
                        <div className="flex flex-col gap-3 text-xs opacity-70">
                          <div className="flex justify-between border-b border-white/5 pb-2"><span>UPTIME</span><span className="text-[var(--accent)]">99.9%</span></div>
                          <div className="flex justify-between border-b border-white/5 pb-2"><span>DATABASE</span><span className="text-[var(--accent)]">CONNECTED</span></div>
                          <div className="flex justify-between"><span>ENCRYPTION</span><span className="text-[var(--accent)]">ACTIVE</span></div>
                        </div>
                      </div>
                      <div className="border border-[var(--border-10)] p-6 bg-[var(--overlay-30)] flex flex-col">
                        <h3 className="text-[var(--accent)] text-[0.7rem] uppercase tracking-widest mb-4">ACTIVE_SESSIONS</h3>
                        <div className="flex flex-col gap-3 text-[10px] overflow-y-auto max-h-[200px] pr-2 hide-scrollbar">
                          {activeSessions.length > 0 ? (
                            activeSessions.map((session, idx) => (
                              <div key={idx} className="flex flex-col gap-1 border-b border-white/5 pb-2">
                                <div className="flex justify-between font-bold text-[var(--accent)]">
                                  <span>{session.device}</span>
                                  <span>{session.timestamp ? new Date(session.timestamp).toLocaleTimeString('id-ID') : 'UNKNOWN_TIME'}</span>
                                </div>
                                <div className="opacity-50">{session.email || 'mohamadrizkiheriyana1@gmail.com'}</div>
                                <div className="opacity-30">ID: {session.sessionId}</div>
                              </div>
                            ))
                          ) : (
                            <div className="opacity-50">NO_ACTIVE_SESSIONS_FOUND...</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : null}
`;

content = content.slice(0, startIdx) + replacement + content.slice(endIdx);
writeFileSync(path, content);
