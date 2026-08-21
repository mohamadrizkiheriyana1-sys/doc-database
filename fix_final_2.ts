import { readFileSync, writeFileSync } from 'fs';
const path = 'src/components/InventoryDashboard.tsx';
let content = readFileSync(path, 'utf-8');

// The profile one was fixed.
// The audit one was broken because my search replace string didn't match.
// I will just use regex to find where `) : (` is, right after `NO_LOGS_FOUND</p></div>)}`
const auditEnd = `                  <div className="flex flex-col items-center py-10">
                    <FileText className="w-8 h-8 text-[var(--text-main)]/20 mb-3" />
                    <p className="text-[var(--text-main)]/40 text-xs uppercase tracking-widest">NO_LOGS_FOUND</p>
                  </div>
                )}
                            ) : (`;

const newAuditEnd = `                  <div className="flex flex-col items-center py-10">
                    <FileText className="w-8 h-8 text-[var(--text-main)]/20 mb-3" />
                    <p className="text-[var(--text-main)]/40 text-xs uppercase tracking-widest">NO_LOGS_FOUND</p>
                  </div>
                )}
              </div>
              </>
            ) : (`;

content = content.replace(auditEnd, newAuditEnd);

writeFileSync(path, content);
