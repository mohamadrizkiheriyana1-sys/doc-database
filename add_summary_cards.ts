import { readFileSync, writeFileSync } from 'fs';

let file = readFileSync('src/components/InventoryDashboard.tsx', 'utf-8');

const target1 = `              <div className="font-['Syne',sans-serif] text-2xl md:text-[2.5rem] leading-none shrink-0">DATABASE OVERVIEW</div>
              <div className="flex flex-col sm:flex-row gap-[10px] shrink-0 justify-between">`;

const replace1 = `              <div className="font-['Syne',sans-serif] text-2xl md:text-[2.5rem] leading-none shrink-0 flex items-center justify-between">
                DATABASE OVERVIEW
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 shrink-0">
                <div className="bg-[var(--overlay-20)] border border-[var(--border-10)] p-4 flex flex-col justify-center">
                  <div className="text-xs text-[var(--text-main)]/50 uppercase tracking-widest mb-1">Total Item</div>
                  <div className="text-2xl font-['Syne'] text-[var(--accent)]">{filteredData.length}</div>
                </div>
                <div className="bg-[var(--overlay-20)] border border-[var(--border-10)] p-4 flex flex-col justify-center">
                  <div className="text-xs text-[var(--text-main)]/50 uppercase tracking-widest mb-1">Aktivitas Login</div>
                  <div className="text-2xl font-['Syne'] text-[var(--accent)]">{auditLogs.filter(log => log.action === 'LOGIN' || log.action === 'LOGIN_FAILED').length}</div>
                </div>
                <div className="bg-[var(--overlay-20)] border border-[var(--border-10)] p-4 flex flex-col justify-center">
                  <div className="text-xs text-[var(--text-main)]/50 uppercase tracking-widest mb-1">Pembaruan Data</div>
                  <div className="text-2xl font-['Syne'] text-[var(--accent)]">{auditLogs.filter(log => log.action === 'ADD' || log.action === 'EDIT' || log.action === 'DELETE').length}</div>
                </div>
                <div className="bg-[var(--overlay-20)] border border-[var(--border-10)] p-4 flex flex-col justify-center">
                  <div className="text-xs text-[var(--text-main)]/50 uppercase tracking-widest mb-1">Pencarian</div>
                  <div className="text-2xl font-['Syne'] text-[var(--accent)]">{auditLogs.filter(log => log.action === 'SEARCH').length}</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-[10px] shrink-0 justify-between">`;

if (file.includes(target1)) {
  file = file.replace(target1, replace1);
  writeFileSync('src/components/InventoryDashboard.tsx', file);
  console.log("Successfully added summary cards.");
} else {
  console.log("Target not found.");
}
