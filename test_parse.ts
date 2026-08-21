import { readFileSync, writeFileSync } from 'fs';
const path = 'src/components/InventoryDashboard.tsx';
let content = readFileSync(path, 'utf-8');

const endStart = content.indexOf(`              {settingsTab === 'profile' ? (`);
const actualEnd = content.slice(endStart);
console.log(actualEnd);
