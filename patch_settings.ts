import { readFileSync, writeFileSync } from 'fs';

const path = 'src/components/InventoryDashboard.tsx';
let content = readFileSync(path, 'utf-8');

// 1. Update activeView state
content = content.replace(
  "const [activeView, setActiveView] = useState<'inventory' | 'add' | 'request' | 'owner' | 'audit'>('inventory');",
  "const [activeView, setActiveView] = useState<'inventory' | 'add' | 'request' | 'owner' | 'audit' | 'settings'>('inventory');"
);

// Add imports
if (!content.includes('sendPasswordResetEmail')) {
  content = content.replace(
    "import { signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';",
    "import { signInWithPopup, onAuthStateChanged, signOut, sendPasswordResetEmail } from 'firebase/auth';"
  );
}

if (!content.includes('doc, setDoc')) {
  content = content.replace(
    "import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, limit } from 'firebase/firestore';",
    "import { collection, addDoc, updateDoc, deleteDoc, doc, setDoc, onSnapshot, query, orderBy, limit } from 'firebase/firestore';"
  );
}

if (!content.includes('UserCircle')) {
  content = content.replace(
    "Trash2, Edit2, Radio, Cloud, CloudOff, RefreshCw, ScanLine",
    "Trash2, Edit2, Radio, Cloud, CloudOff, RefreshCw, ScanLine, UserCircle, Key, Save"
  );
}

// 2. Add state for settings
const stateInjection = `  const [settingsName, setSettingsName] = useState('Riki');
  const [settingsApp, setSettingsApp] = useState('GudangKu');
  const [settingsStatus, setSettingsStatus] = useState<{type: 'success' | 'error', msg: string} | null>(null);
`;
content = content.replace(
  "const [activeSessions, setActiveSessions] = useState<any[]>([]);",
  "const [activeSessions, setActiveSessions] = useState<any[]>([]);\n" + stateInjection
);

// 3. Add useEffect to load settings
const loadSettingsHook = `    // Listen to settings
    const unsubSettings = onSnapshot(doc(db, 'settings', 'profile'), (docSnap) => {
      if (docSnap.exists() && mounted) {
        const data = docSnap.data();
        if (data.name) setSettingsName(data.name);
        if (data.appName) setSettingsApp(data.appName);
      }
    });`;
content = content.replace(
  "// Listen to audit logs",
  loadSettingsHook + "\n\n    // Listen to audit logs"
);

content = content.replace(
  "unsubAudit();",
  "unsubAudit();\n      unsubSettings();"
);

// 4. Update the header to reflect dynamic name
content = content.replace(
  `Owner App Riki`,
  `Owner App {settingsName}`
);
content = content.replace(
  `GUDANGKU_`,
  `{settingsApp.toUpperCase()}_`
);

// 5. Add Sidebar Menu
const sidebarMenu = `            <button 
              onClick={() => setActiveView('audit')}
              className={\`text-left px-4 py-3 md:px-10 md:py-[15px] text-[0.7rem] uppercase border-b-2 md:border-b-0 md:border-l-2 cursor-pointer transition-all \${activeView === 'audit' ? 'border-[#00f2ff] opacity-100 text-[#00f2ff]' : 'border-transparent opacity-60'}\`}
            >
              05. Audit Log
            </button>
            <button 
              onClick={() => setActiveView('settings')}
              className={\`text-left px-4 py-3 md:px-10 md:py-[15px] text-[0.7rem] uppercase border-b-2 md:border-b-0 md:border-l-2 cursor-pointer transition-all \${activeView === 'settings' ? 'border-[#00f2ff] opacity-100 text-[#00f2ff]' : 'border-transparent opacity-60'}\`}
            >
              06. Pengaturan
            </button>`;
content = content.replace(
  /<button \n\s*onClick=\{\(\) => setActiveView\('audit'\)\}[\s\S]*?<\/button>/,
  sidebarMenu
);

// 6. Add Settings View UI
const settingsHandlers = `
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'settings', 'profile'), {
        name: settingsName,
        appName: settingsApp,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      await addAuditLog('EDIT', 'Update Profil Sistem', { name: settingsName, appName: settingsApp });
      setSettingsStatus({ type: 'success', msg: 'PROFIL BERHASIL DIPERBARUI' });
      setTimeout(() => setSettingsStatus(null), 3000);
    } catch (err) {
      console.error(err);
      setSettingsStatus({ type: 'error', msg: 'GAGAL MEMPERBARUI PROFIL' });
    }
  };

  const handleResetPassword = async () => {
    if (!auth.currentUser?.email) return;
    try {
      await sendPasswordResetEmail(auth, auth.currentUser.email);
      setSettingsStatus({ type: 'success', msg: 'LINK RESET PASSWORD TELAH DIKIRIM KE EMAIL' });
      await addAuditLog('EDIT', 'Request Password Reset', { email: auth.currentUser.email });
      setTimeout(() => setSettingsStatus(null), 5000);
    } catch (err) {
      console.error(err);
      setSettingsStatus({ type: 'error', msg: 'GAGAL MENGIRIM LINK RESET PASSWORD' });
    }
  };
`;
content = content.replace(
  "const handleAddPart = async (e: React.FormEvent) => {",
  settingsHandlers + "\n  const handleAddPart = async (e: React.FormEvent) => {"
);

const auditView = `          ) : activeView === 'audit' ? (`;
const settingsView = `          ) : activeView === 'settings' ? (
            <div className="flex-1 md:overflow-y-auto flex flex-col pt-4 md:pt-10">
              <h2 className="text-xl md:text-2xl font-['Syne'] text-[#00f2ff] mb-2 uppercase tracking-[-0.02em]">PENGATURAN</h2>
              <p className="text-[#ececec]/40 text-[10px] uppercase tracking-[0.2em] mb-6 md:mb-8 border-b border-[rgba(236,236,236,0.1)] pb-4">
                SYSTEM_PREFERENCES_AND_SECURITY
              </p>
              
              {settingsStatus && (
                <div className={\`p-4 mb-6 text-xs uppercase tracking-widest border \${settingsStatus.type === 'success' ? 'bg-[#00f2ff]/10 border-[#00f2ff]/30 text-[#00f2ff]' : 'bg-red-500/10 border-red-500/30 text-red-500'}\`}>
                  {settingsStatus.msg}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                {/* Profil Pemilik */}
                <form onSubmit={handleSaveProfile} className="bg-black/20 border border-[rgba(236,236,236,0.1)] p-6 flex flex-col gap-6">
                  <div className="flex items-center gap-3 border-b border-[rgba(236,236,236,0.1)] pb-4">
                    <UserCircle className="w-5 h-5 text-[#00f2ff]" />
                    <h3 className="text-sm tracking-widest uppercase">Profil Sistem</h3>
                  </div>
                  
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="block text-[0.6rem] uppercase text-[#ececec]/60 mb-2 tracking-widest">Nama Aplikasi</label>
                      <input 
                        type="text" 
                        value={settingsApp}
                        onChange={(e) => setSettingsApp(e.target.value)}
                        required
                        className="w-full bg-black/30 border border-[rgba(236,236,236,0.1)] p-3 text-[#ececec] outline-none focus:border-[#00f2ff]/50 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[0.6rem] uppercase text-[#ececec]/60 mb-2 tracking-widest">Nama Pemilik / Admin</label>
                      <input 
                        type="text" 
                        value={settingsName}
                        onChange={(e) => setSettingsName(e.target.value)}
                        required
                        className="w-full bg-black/30 border border-[rgba(236,236,236,0.1)] p-3 text-[#ececec] outline-none focus:border-[#00f2ff]/50 transition-colors"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="mt-auto bg-[#111113] hover:bg-[#00f2ff] hover:text-black text-[#ececec] border border-[rgba(236,236,236,0.2)] hover:border-[#00f2ff] px-4 py-3 text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    SIMPAN PROFIL
                  </button>
                </form>

                {/* Keamanan */}
                <div className="bg-black/20 border border-[rgba(236,236,236,0.1)] p-6 flex flex-col gap-6">
                  <div className="flex items-center gap-3 border-b border-[rgba(236,236,236,0.1)] pb-4">
                    <Key className="w-5 h-5 text-yellow-500" />
                    <h3 className="text-sm tracking-widest uppercase">Keamanan Akun</h3>
                  </div>
                  
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="block text-[0.6rem] uppercase text-[#ececec]/60 mb-2 tracking-widest">Email Terdaftar</label>
                      <div className="w-full bg-black/50 border border-[rgba(236,236,236,0.05)] p-3 text-[#ececec]/60 text-sm opacity-70 cursor-not-allowed">
                        {auth.currentUser?.email || 'Tidak ada sesi aktif'}
                      </div>
                      <p className="text-[0.55rem] text-[#ececec]/40 mt-2 uppercase">Email terhubung dengan Google Auth.</p>
                    </div>
                  </div>

                  <div className="mt-auto pt-4 flex flex-col gap-2 border-t border-[rgba(236,236,236,0.1)]">
                    <p className="text-[0.6rem] text-[#ececec]/60 leading-relaxed">
                      Sistem akan mengirimkan tautan penyetelan ulang sandi (Password Reset) ke alamat email Anda. Ikuti instruksi di email tersebut untuk mengubah sandi.
                    </p>
                    <button 
                      onClick={handleResetPassword}
                      type="button"
                      className="bg-[#111113] hover:bg-yellow-500 hover:text-black text-yellow-500 border border-yellow-500/30 px-4 py-3 text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 mt-2"
                    >
                      KIRIM LINK UBAH PASSWORD
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : activeView === 'audit' ? (`;
content = content.replace(auditView, settingsView);

writeFileSync(path, content);
