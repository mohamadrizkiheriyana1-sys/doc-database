import { readFileSync, writeFileSync } from 'fs';

const path = 'src/components/InventoryDashboard.tsx';
let content = readFileSync(path, 'utf-8');

content = content.replace(
  '<><CloudOff className="w-3 h-3" /> <span>G-SHEETS GAGAL</span></>',
  '<><CloudOff className="w-3 h-3" /> <span>ERROR</span></>'
);

content = content.replace(
  '<><RefreshCw className="w-3 h-3 animate-spin" /> <span className="animate-pulse">SINKRONISASI...</span></>',
  '<><RefreshCw className="w-3 h-3 animate-spin" /> <span className="animate-pulse">SYNCING</span></>'
);

content = content.replace(
  '<><Cloud className="w-3 h-3" /> <span>G-SHEETS SINKRON</span></>',
  '<><Cloud className="w-3 h-3" /> <span>SYNCED</span></>'
);

writeFileSync(path, content);
