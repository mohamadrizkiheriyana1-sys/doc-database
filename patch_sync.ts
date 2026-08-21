import { readFileSync, writeFileSync } from 'fs';

const path = 'src/components/InventoryDashboard.tsx';
let content = readFileSync(path, 'utf-8');

// Also import Cloud, CloudOff if they aren't imported.
if (!content.includes('Cloud')) {
  content = content.replace(
    'Radio } from \'lucide-react\';',
    'Radio, Cloud, CloudOff, RefreshCw } from \'lucide-react\';'
  );
}

const oldHeader = `        <header className="shrink-0 col-span-full flex items-center px-4 md:px-10 py-4 md:py-0 md:h-full border-b border-[rgba(236,236,236,0.1)] justify-between">
          <div className="flex flex-col">
            <div className="font-['Syne',sans-serif] text-xl md:text-[1.8rem] tracking-[-0.04em] text-[#00f2ff]">GUDANGKU_</div>
            <div className="text-[0.55rem] text-[#00f2ff] uppercase tracking-widest mt-[-2px]">Owner App Riki</div>
          </div>
          <div className="text-[0.6rem] uppercase text-[#ececec]">Node_07 / Active</div>
        </header>`;

const newHeader = `        <header className="shrink-0 col-span-full flex items-center px-4 md:px-10 py-4 md:py-0 md:h-full border-b border-[rgba(236,236,236,0.1)] justify-between">
          <div className="flex flex-col">
            <div className="font-['Syne',sans-serif] text-xl md:text-[1.8rem] tracking-[-0.04em] text-[#00f2ff]">GUDANGKU_</div>
            <div className="text-[0.55rem] text-[#00f2ff] uppercase tracking-widest mt-[-2px]">Owner App Riki</div>
          </div>
          <div className="flex items-center gap-4">
            <div className={\`flex items-center gap-2 text-[0.55rem] md:text-[0.6rem] uppercase px-3 py-1.5 border \${error ? 'text-red-500 border-red-500/30 bg-red-500/10' : loading ? 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10' : 'text-[#00f2ff] border-[#00f2ff]/30 bg-[#00f2ff]/10'}\`} title="Status Sinkronisasi G-Sheets (Baca-saja)">
              {error ? (
                <><CloudOff className="w-3 h-3" /> <span>G-SHEETS GAGAL</span></>
              ) : loading ? (
                <><RefreshCw className="w-3 h-3 animate-spin" /> <span className="animate-pulse">SINKRONISASI...</span></>
              ) : (
                <><Cloud className="w-3 h-3" /> <span>G-SHEETS SINKRON</span></>
              )}
            </div>
            <div className="text-[0.6rem] uppercase text-[#ececec] hidden sm:block">Node_07 / Active</div>
          </div>
        </header>`;

content = content.replace(oldHeader, newHeader);

writeFileSync(path, content);
