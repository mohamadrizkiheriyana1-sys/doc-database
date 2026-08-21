import { readFileSync, writeFileSync } from 'fs';

const path = 'src/components/InventoryDashboard.tsx';
let content = readFileSync(path, 'utf-8');

// Add settingsTab state
if (!content.includes('settingsTab')) {
  content = content.replace(
    "const [settingsStatus, setSettingsStatus] = useState<{type: 'success' | 'error', msg: string} | null>(null);",
    "const [settingsStatus, setSettingsStatus] = useState<{type: 'success' | 'error', msg: string} | null>(null);\n  const [settingsTab, setSettingsTab] = useState<'profile' | 'owner' | 'audit'>('profile');"
  );
}

// Update sidebar navigation - remove owner and audit
const oldSidebarNav = `<button 
              onClick={() => setActiveView('owner')}
              className={\`text-left px-4 py-3 md:px-10 md:py-[15px] text-[0.7rem] uppercase border-b-2 md:border-b-0 md:border-l-2 cursor-pointer transition-all \${activeView === 'owner' ? 'border-[var(--accent)] opacity-100 text-[var(--accent)]' : 'border-transparent opacity-60'}\`}
            >
              04. Owner
            </button>
            <button 
              onClick={() => setActiveView('audit')}
              className={\`text-left px-4 py-3 md:px-10 md:py-[15px] text-[0.7rem] uppercase border-b-2 md:border-b-0 md:border-l-2 cursor-pointer transition-all \${activeView === 'audit' ? 'border-[var(--accent)] opacity-100 text-[var(--accent)]' : 'border-transparent opacity-60'}\`}
            >
              05. Audit Log
            </button>
            <button 
              onClick={() => setActiveView('settings')}
              className={\`text-left px-4 py-3 md:px-10 md:py-[15px] text-[0.7rem] uppercase border-b-2 md:border-b-0 md:border-l-2 cursor-pointer transition-all \${activeView === 'settings' ? 'border-[var(--accent)] opacity-100 text-[var(--accent)]' : 'border-transparent opacity-60'}\`}
            >
              06. Pengaturan
            </button>`;

const newSidebarNav = `<button 
              onClick={() => setActiveView('settings')}
              className={\`text-left px-4 py-3 md:px-10 md:py-[15px] text-[0.7rem] uppercase border-b-2 md:border-b-0 md:border-l-2 cursor-pointer transition-all \${activeView === 'settings' ? 'border-[var(--accent)] opacity-100 text-[var(--accent)]' : 'border-transparent opacity-60'}\`}
            >
              04. Pengaturan
            </button>`;

content = content.replace(oldSidebarNav, newSidebarNav);

writeFileSync(path, content);
