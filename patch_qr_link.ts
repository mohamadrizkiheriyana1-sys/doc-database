import { readFileSync, writeFileSync } from 'fs';

const path = 'src/components/InventoryDashboard.tsx';
let content = readFileSync(path, 'utf-8');

const oldQrCode = "<QRCode value={typeof window !== 'undefined' ? window.location.href : 'https://gudangku.app'} size={150} />";
const newQrCode = '<QRCode value="https://gudangku-1.ai.studio/" size={150} />';

content = content.replace(oldQrCode, newQrCode);

writeFileSync(path, content);
