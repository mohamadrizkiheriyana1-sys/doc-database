import { readFileSync, writeFileSync } from 'fs';

const path = 'src/components/InventoryDashboard.tsx';
let content = readFileSync(path, 'utf-8');

const searchInputBlock = `              <div className="flex flex-col sm:flex-row gap-[10px] shrink-0">
                <input
                  type="text"
                  placeholder="QUERY_ID_OR_SKU..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (e.target.value === '') setAppliedQuery('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setAppliedQuery(searchQuery);
                    }
                  }}
                  className="bg-black/50 border border-[rgba(236,236,236,0.2)] text-[#ececec] p-[10px_15px] text-[0.75rem] uppercase tracking-widest outline-none focus:border-[#00f2ff] transition-colors w-full sm:max-w-md placeholder:text-[rgba(236,236,236,0.3)]"
                />
              </div>`;

const searchInputBlockWithButton = `              <div className="flex flex-col sm:flex-row gap-[10px] shrink-0 justify-between items-start sm:items-center w-full">
                <input
                  type="text"
                  placeholder="QUERY_ID_OR_SKU..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (e.target.value === '') setAppliedQuery('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setAppliedQuery(searchQuery);
                    }
                  }}
                  className="bg-black/50 border border-[rgba(236,236,236,0.2)] text-[#ececec] p-[10px_15px] text-[0.75rem] uppercase tracking-widest outline-none focus:border-[#00f2ff] transition-colors w-full sm:max-w-md placeholder:text-[rgba(236,236,236,0.3)]"
                />
                <button
                  onClick={handleExportInventoryCSV}
                  className="flex items-center gap-2 bg-[#111113] border border-[rgba(236,236,236,0.2)] hover:border-[#00f2ff] hover:text-[#00f2ff] transition-colors text-[#ececec] p-[10px_15px] text-[0.7rem] uppercase tracking-widest font-bold w-full sm:w-auto justify-center"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  EXPORT_CSV
                </button>
              </div>`;

content = content.replace(searchInputBlock, searchInputBlockWithButton);
writeFileSync(path, content);
