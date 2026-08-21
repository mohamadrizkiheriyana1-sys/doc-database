import { readFileSync, writeFileSync } from 'fs';

const path = 'src/components/InventoryDashboard.tsx';
let content = readFileSync(path, 'utf-8');

// Find start indices
const settingsIndex = content.indexOf(`) : activeView === 'settings' ? (`);
const auditIndex = content.indexOf(`) : activeView === 'audit' ? (`);
const ownerIndex = content.indexOf(`) : activeView === 'owner' ? (`);
const endIndex = content.indexOf(`) : null}`);

if (settingsIndex !== -1 && auditIndex !== -1 && ownerIndex !== -1) {
  const profileHtml = content.slice(content.indexOf(`{settingsStatus && (`, settingsIndex), auditIndex);
  const auditHtml = content.slice(content.indexOf(`<div className="w-full`, auditIndex), ownerIndex);
  
  // owner content is nested in a div. Let's get the inner content.
  const ownerInnerIndex = content.indexOf(`<div className="w-full max-w-4xl`, ownerIndex);
  const ownerHtml = content.slice(ownerInnerIndex, endIndex);

  // Clean them up slightly to remove closing tags from previous views that aren't needed inside fragments
  const cleanProfile = profileHtml.replace(/<\/div>\s*$/, '');
  const cleanAudit = auditHtml.replace(/<\/div>\s*<\/div>\s*$/, '');
  const cleanOwner = ownerHtml.replace(/<\/div>\s*<\/div>\s*$/, '');

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
                  ${cleanProfile}
              ) : settingsTab === 'audit' ? (
                <>
                  ${cleanAudit}
              ) : (
                <div className="flex justify-center items-start">
                  ${cleanOwner}
                </div>
              )}
            </div>
          `;
          
  content = content.slice(0, settingsIndex) + newSection + content.slice(endIndex);
  writeFileSync(path, content);
  console.log("Success");
} else {
  console.log("Indexes not found");
}
