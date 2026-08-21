import { readFileSync, writeFileSync } from 'fs';
const path = 'src/components/InventoryDashboard.tsx';
let content = readFileSync(path, 'utf-8');

const targetStr = `            <button 
              onClick={() => setActiveView('settings')}
              className={\`text-left px-4 py-3 md:px-10 md:py-[15px] text-[0.7rem] uppercase border-b-2 md:border-b-0 md:border-l-2 cursor-pointer transition-all \${activeView === 'settings' ? 'border-[var(--accent)] opacity-100 text-[var(--accent)]' : 'border-transparent opacity-60'}\`}
            >
              04. Pengaturan
            </button>
          </nav>
          
          {/* Drag handle for resizing */}`;

const replacementStr = `            <button 
              onClick={() => setActiveView('settings')}
              className={\`text-left px-4 py-3 md:px-10 md:py-[15px] text-[0.7rem] uppercase border-b-2 md:border-b-0 md:border-l-2 cursor-pointer transition-all \${activeView === 'settings' ? 'border-[var(--accent)] opacity-100 text-[var(--accent)]' : 'border-transparent opacity-60'}\`}
            >
              04. Pengaturan
            </button>
          </nav>
          
          {/* Mobile QR */}
          <div className="hidden md:flex flex-col items-center mt-auto p-4 mb-4 opacity-30 hover:opacity-100 transition-opacity">
            <p className="text-[10px] uppercase tracking-widest text-[var(--text-main)] mb-3 font-bold">Akses Mobile</p>
            <div className="bg-white p-2 border border-[var(--border-20)]">
              <QRCode value={typeof window !== 'undefined' ? window.location.href : 'https://ai.studio'} size={90} />
            </div>
            <p className="text-[0.55rem] uppercase tracking-widest text-[var(--text-main)]/50 mt-3 text-center leading-relaxed">
              Scan untuk buka <br/>di HP
            </p>
          </div>
          
          {/* Drag handle for resizing */}`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replacementStr);
  writeFileSync(path, content);
  console.log("Successfully added QR code.");
} else {
  console.log("Target string not found.");
}
