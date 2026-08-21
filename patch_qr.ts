import { readFileSync, writeFileSync } from 'fs';

const path = 'src/components/InventoryDashboard.tsx';
let content = readFileSync(path, 'utf-8');

// Add import
if (!content.includes('import QRCode from')) {
  content = content.replace(
    "import BarcodeScanner from './BarcodeScanner';",
    "import BarcodeScanner from './BarcodeScanner';\nimport QRCode from 'react-qr-code';"
  );
}

// Find login prompt
const oldLoginPrompt = `            <div className="flex flex-col gap-2">
              <h2 className="text-[#00f2ff] font-['Syne',sans-serif] text-xl">OTORISASI AKSES GUDANGKU</h2>
              <p className="text-xs opacity-60">Silakan verifikasi identitas (Login dengan Google) Anda untuk mengakses sistem dan dicatat dalam log Active Sessions.</p>
            </div>
            
            <button 
              onClick={handleGoogleLogin}
              className="bg-[#00f2ff] text-black uppercase text-xs tracking-widest font-bold py-3 hover:bg-white transition-colors"
            >
              LOGIN DENGAN GOOGLE
            </button>`;

const newLoginPrompt = `            <div className="flex flex-col gap-2">
              <h2 className="text-[#00f2ff] font-['Syne',sans-serif] text-xl text-center">OTORISASI AKSES GUDANGKU</h2>
              <p className="text-xs opacity-60 text-center">Silakan verifikasi identitas (Login dengan Google) Anda untuk mengakses sistem dan dicatat dalam log Active Sessions.</p>
            </div>
            
            <div className="flex flex-col items-center gap-4 bg-black/50 p-4 border border-[rgba(236,236,236,0.1)]">
              <p className="text-[0.65rem] uppercase tracking-widest text-[#ececec]/60">Login Cepat via HP</p>
              <div className="bg-white p-2">
                <QRCode value={typeof window !== 'undefined' ? window.location.href : 'https://gudangku.app'} size={150} />
              </div>
              <p className="text-[0.6rem] uppercase tracking-widest text-[#00f2ff]/80 text-center">Scan QR untuk membuka aplikasi ini di perangkat mobile Anda</p>
            </div>

            <button 
              onClick={handleGoogleLogin}
              className="bg-[#00f2ff] text-black uppercase text-xs tracking-widest font-bold py-3 hover:bg-white transition-colors"
            >
              LOGIN DENGAN GOOGLE
            </button>`;

content = content.replace(oldLoginPrompt, newLoginPrompt);

writeFileSync(path, content);
