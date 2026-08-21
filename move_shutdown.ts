import { readFileSync, writeFileSync } from 'fs';
const path = 'src/components/InventoryDashboard.tsx';
let content = readFileSync(path, 'utf-8');

const targetHeader = `            <div className="text-[0.6rem] uppercase text-[var(--text-main)] hidden sm:block">Node_07 / Active</div>
          </div>
        </header>`;

const replacementHeader = `            <div className="text-[0.6rem] uppercase text-[var(--text-main)] hidden sm:block">Node_07 / Active</div>
            <button 
              className="flex items-center gap-2 cursor-pointer text-red-500 hover:text-red-400 border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 text-[0.55rem] md:text-[0.6rem] uppercase tracking-widest transition-all" 
              onClick={onLogout} 
              title="Shutdown System"
            >
              <LogOut className="w-3 h-3" />
              <span className="hidden md:inline">SHUTDOWN</span>
            </button>
          </div>
        </header>`;

const targetFooter = `        {/* Footer */}
        <footer className="shrink-0 col-span-full border-t border-[var(--border-10)] flex items-center justify-between px-4 md:px-10 py-3 md:py-0 text-[0.6rem] opacity-50">
          <div>SYSTEM BUILD V2.4.0</div>
          <div className="cursor-pointer text-[var(--accent)] hover:opacity-100 transition-opacity" onClick={onLogout}>SHUTDOWN_SYS</div>
        </footer>`;

const replacementFooter = `        {/* Footer */}
        <footer className="shrink-0 col-span-full border-t border-[var(--border-10)] flex items-center justify-between px-4 md:px-10 py-3 md:py-0 text-[0.6rem] opacity-50">
          <div>SYSTEM BUILD V2.4.0</div>
          <div>STATUS: OK</div>
        </footer>`;

if (content.includes(targetHeader) && content.includes(targetFooter)) {
  content = content.replace(targetHeader, replacementHeader);
  content = content.replace(targetFooter, replacementFooter);
  writeFileSync(path, content);
  console.log("Successfully moved shutdown.");
} else {
  console.log("Target strings not found");
}
