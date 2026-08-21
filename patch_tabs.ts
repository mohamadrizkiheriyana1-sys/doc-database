import { readFileSync, writeFileSync } from 'fs';

const path = 'src/components/InventoryDashboard.tsx';
let content = readFileSync(path, 'utf-8');

// 1. Extract settings view, audit view, and owner view content
const getBlock = (startMatch: string, endMatch: string) => {
  const startIndex = content.indexOf(startMatch);
  if (startIndex === -1) return '';
  const endIndex = content.indexOf(endMatch, startIndex);
  if (endIndex === -1) return '';
  return content.slice(startIndex + startMatch.length, endIndex).trim();
};

const profileContent = getBlock(
  `{settingsStatus && (`,
  `) : activeView === 'audit' ? (`
);

const auditContent = getBlock(
  `<p className="text-[var(--text-main)]/40 text-[10px] uppercase tracking-[0.2em] mb-6 md:mb-8 border-b border-[var(--border-10)] pb-4">
                SYSTEM_MODIFICATION_RECORDS
              </p>`,
  `) : activeView === 'owner' ? (`
);

const ownerContent = getBlock(
  `<p className="text-[var(--text-main)]/40 text-[10px] uppercase tracking-[0.2em] mb-6 md:mb-8 border-b border-[var(--border-10)] pb-4">
                MANAGE_MASTER_SKU_CATALOG
              </p>`,
  `          ) : null}`
);

if (profileContent && auditContent && ownerContent) {
  // Replace the entire section from settings to the end
  const fullMatchStart = `) : activeView === 'settings' ? (`;
  const fullMatchEnd = `) : null}`;
  
  const startIndex = content.indexOf(fullMatchStart);
  const endIndex = content.indexOf(fullMatchEnd, startIndex);
  
  const newSection = `) : activeView === 'settings' ? (
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
                  Master SKU
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
${profileContent}
                </>
              ) : settingsTab === 'audit' ? (
                <>
${auditContent}
                </>
              ) : (
                <>
${ownerContent}
                </>
              )}
            </div>
          `;
          
  content = content.slice(0, startIndex) + newSection + content.slice(endIndex);
  writeFileSync(path, content);
  console.log("Success");
} else {
  console.error("Failed to extract blocks");
}
