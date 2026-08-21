import { readFileSync, writeFileSync } from 'fs';

const path = 'src/components/InventoryDashboard.tsx';
let content = readFileSync(path, 'utf-8');

// Import BarcodeScanner and ScanLine icon
if (!content.includes('ScanLine')) {
  content = content.replace(
    'CloudOff, RefreshCw } from \'lucide-react\';',
    'CloudOff, RefreshCw, ScanLine } from \'lucide-react\';'
  );
}

if (!content.includes('BarcodeScanner')) {
  content = content.replace(
    "import { signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';",
    "import { signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';\nimport BarcodeScanner from './BarcodeScanner';"
  );
}

// Add state for scanning
if (!content.includes('scanTarget')) {
  const stateInjection = `  const [scanTarget, setScanTarget] = useState<'search' | 'addSku' | 'reqSku' | null>(null);`;
  content = content.replace(
    "const [appliedQuery, setAppliedQuery] = useState('');",
    "const [appliedQuery, setAppliedQuery] = useState('');\n" + stateInjection
  );
}

// Add scanner handler
if (!content.includes('handleScanComplete')) {
  const handlerInjection = `
  const handleScanComplete = (decodedText: string) => {
    if (scanTarget === 'search') {
      setSearchQuery(decodedText);
      setAppliedQuery(decodedText);
      setActiveView('inventory');
    } else if (scanTarget === 'addSku') {
      setNewSku(decodedText);
    } else if (scanTarget === 'reqSku') {
      setRequestSku(decodedText);
    }
    setScanTarget(null);
  };
`;
  content = content.replace(
    "  const handleAddPart = async (e: React.FormEvent) => {",
    handlerInjection + "\n  const handleAddPart = async (e: React.FormEvent) => {"
  );
}

// Update Search Bar
const oldSearchBlock = `                  <input
                    type="text"
                    placeholder="QUERY_ID_OR_SKU..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (e.target.value === '') setAppliedQuery('');
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && setAppliedQuery(searchQuery)}
                    className="flex-1 bg-black/30 border border-[rgba(236,236,236,0.1)] p-3 text-[#ececec] outline-none placeholder:text-white/30 focus:border-[#00f2ff]/50 transition-colors"
                  />`;
const newSearchBlock = `                  <div className="flex-1 flex relative">
                    <input
                      type="text"
                      placeholder="QUERY_ID_OR_SKU..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        if (e.target.value === '') setAppliedQuery('');
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && setAppliedQuery(searchQuery)}
                      className="w-full bg-black/30 border border-[rgba(236,236,236,0.1)] p-3 pr-10 text-[#ececec] outline-none placeholder:text-white/30 focus:border-[#00f2ff]/50 transition-colors"
                    />
                    <button 
                      onClick={() => setScanTarget('search')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#ececec]/50 hover:text-[#00f2ff] transition-colors"
                      title="Scan Barcode"
                    >
                      <ScanLine className="w-4 h-4" />
                    </button>
                  </div>`;
content = content.replace(oldSearchBlock, newSearchBlock);

// Update Add Sku Input
const oldAddSkuBlock = `                  <div>
                    <label className="block text-[0.6rem] uppercase text-[#ececec]/60 mb-2 tracking-widest">SKU ID</label>
                    <input 
                      type="text" 
                      value={newSku}
                      onChange={(e) => setNewSku(e.target.value)}
                      required
                      className="w-full bg-black/30 border border-[rgba(236,236,236,0.1)] p-3 text-[#ececec] outline-none focus:border-[#00f2ff]/50 transition-colors"
                    />
                  </div>`;
const newAddSkuBlock = `                  <div>
                    <label className="block text-[0.6rem] uppercase text-[#ececec]/60 mb-2 tracking-widest">SKU ID</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={newSku}
                        onChange={(e) => setNewSku(e.target.value)}
                        required
                        className="w-full bg-black/30 border border-[rgba(236,236,236,0.1)] p-3 pr-10 text-[#ececec] outline-none focus:border-[#00f2ff]/50 transition-colors"
                      />
                      <button 
                        type="button"
                        onClick={() => setScanTarget('addSku')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#ececec]/50 hover:text-[#00f2ff] transition-colors"
                      >
                        <ScanLine className="w-4 h-4" />
                      </button>
                    </div>
                  </div>`;
content = content.replace(oldAddSkuBlock, newAddSkuBlock);

// Update Request Sku Input
const oldReqSkuBlock = `                  <div>
                    <label className="block text-[0.6rem] uppercase text-[#ececec]/60 mb-2 tracking-widest">SKU ID</label>
                    <input 
                      type="text" 
                      value={requestSku}
                      onChange={(e) => setRequestSku(e.target.value)}
                      required
                      className="w-full bg-black/30 border border-[rgba(236,236,236,0.1)] p-3 text-[#ececec] outline-none focus:border-[#00f2ff]/50 transition-colors"
                    />
                  </div>`;
const newReqSkuBlock = `                  <div>
                    <label className="block text-[0.6rem] uppercase text-[#ececec]/60 mb-2 tracking-widest">SKU ID</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={requestSku}
                        onChange={(e) => setRequestSku(e.target.value)}
                        required
                        className="w-full bg-black/30 border border-[rgba(236,236,236,0.1)] p-3 pr-10 text-[#ececec] outline-none focus:border-[#00f2ff]/50 transition-colors"
                      />
                      <button 
                        type="button"
                        onClick={() => setScanTarget('reqSku')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#ececec]/50 hover:text-[#00f2ff] transition-colors"
                      >
                        <ScanLine className="w-4 h-4" />
                      </button>
                    </div>
                  </div>`;
content = content.replace(oldReqSkuBlock, newReqSkuBlock);

// Render the scanner overlay
const scannerRender = `      {showEmailPrompt && (`;
const newScannerRender = `      {scanTarget && (
        <BarcodeScanner 
          onScan={handleScanComplete} 
          onClose={() => setScanTarget(null)} 
        />
      )}
      {showEmailPrompt && (`;
content = content.replace(scannerRender, newScannerRender);

writeFileSync(path, content);
