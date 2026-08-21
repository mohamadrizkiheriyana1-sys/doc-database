import { readFileSync, writeFileSync } from 'fs';
const path = 'src/components/InventoryDashboard.tsx';
let content = readFileSync(path, 'utf-8');

const endStart = content.indexOf(`                          <div className="opacity-50">NO_ACTIVE_SESSIONS_FOUND...</div>`);
const actualEnd = content.slice(endStart);
console.log(actualEnd);
