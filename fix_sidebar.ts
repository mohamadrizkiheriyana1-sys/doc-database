import { readFileSync, writeFileSync } from 'fs';
const path = 'src/components/InventoryDashboard.tsx';
let content = readFileSync(path, 'utf-8');

const targetStr = `            <button 
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

const replacementStr = `            <button 
              onClick={() => setActiveView('settings')}
              className={\`text-left px-4 py-3 md:px-10 md:py-[15px] text-[0.7rem] uppercase border-b-2 md:border-b-0 md:border-l-2 cursor-pointer transition-all \${activeView === 'settings' ? 'border-[var(--accent)] opacity-100 text-[var(--accent)]' : 'border-transparent opacity-60'}\`}
            >
              04. Pengaturan
            </button>`;

// Replace exact target string
if (content.includes(targetStr)) {
  content = content.replace(targetStr, replacementStr);
  writeFileSync(path, content);
  console.log("Successfully replaced sidebar menus.");
} else {
  console.log("Target string not found. Let's try finding them individually.");
}
