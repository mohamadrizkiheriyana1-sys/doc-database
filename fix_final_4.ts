import { readFileSync, writeFileSync } from 'fs';
const path = 'src/components/InventoryDashboard.tsx';
const lines = readFileSync(path, 'utf-8').split('\n');

for (let i = 1260; i < 1275; i++) {
  if (lines[i] && lines[i].includes(') : (')) {
    if (!lines[i].includes('</>')) {
      lines[i] = lines[i].replace(') : (', '</> ) : (');
    }
  }
}
// Remove the duplicate I created
lines[1266] = '                )}'; // This was line 1267 in 1-based, 1266 in 0-based.

writeFileSync(path, lines.join('\n'));
