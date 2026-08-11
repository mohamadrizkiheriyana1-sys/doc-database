import React, { useState, useEffect, useMemo } from 'react';
import { getSpreadsheetData } from '../lib/sheets';
import { InventoryItem } from '../types';
import { Search, Loader2, Database, AlertCircle, Package, LogOut } from 'lucide-react';

interface InventoryDashboardProps {
  onLogout: () => void;
}

const SPREADSHEET_ID = '1wgiFxu3-fBXZtnax6XlQ40reQUR0C26Y6eWFWMGGWcI';

export default function InventoryDashboard({ onLogout }: InventoryDashboardProps) {
  const [data, setData] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const rows = await getSpreadsheetData(SPREADSHEET_ID);
        
        if (!mounted) return;

        if (rows.length < 2) {
          setData([]);
          setLoading(false);
          return;
        }

        // The first row is usually headers
        const headers = rows[0].map(h => h.toLowerCase().trim());
        
        // Find indices for our target columns
        // Handle variations in naming (e.g. 'kode', 'kode part', 'sku', 'deskripsi part')
        const kodeIdx = headers.findIndex(h => h.includes('kode'));
        const skuIdx = headers.findIndex(h => h.includes('sku'));
        const deskripsiIdx = headers.findIndex(h => h.includes('deskripsi') || h.includes('description'));

        const parsedData: InventoryItem[] = rows.slice(1).map(row => ({
          kode: kodeIdx >= 0 ? (row[kodeIdx] || '-') : '-',
          sku: skuIdx >= 0 ? (row[skuIdx] || '-') : '-',
          deskripsi: deskripsiIdx >= 0 ? (row[deskripsiIdx] || '-') : '-',
          rawData: row,
        })).filter(item => item.kode !== '-' || item.sku !== '-' || item.deskripsi !== '-');

        setData(parsedData);
      } catch (err: any) {
        if (!mounted) return;
        setError(err.message || 'Gagal memuat data dari spreadsheet.');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const query = searchQuery.toLowerCase();
    return data.filter(
      item => 
        item.kode.toLowerCase().includes(query) ||
        item.sku.toLowerCase().includes(query) ||
        item.deskripsi.toLowerCase().includes(query)
    );
  }, [data, searchQuery]);

  return (
    <div className="h-screen bg-[#111113] text-[#EDEDED] flex flex-col overflow-hidden font-sans antialiased">
      {/* Header */}
      <header className="border-b border-white/10 px-8 py-4 flex justify-between items-center shrink-0">
        <div className="font-extrabold text-2xl tracking-[-0.05em]">
          GUDANG<span className="text-[#5D5FEF]">KU</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="font-mono text-[0.7rem] text-white/60">
            DATABASE_ID: {SPREADSHEET_ID.substring(0, 16).toUpperCase()}
          </div>
          <button 
            onClick={onLogout}
            className="text-white/40 hover:text-[#EDEDED] transition-colors flex items-center gap-2 text-xs font-mono tracking-wider uppercase"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">LOGOUT</span>
          </button>
        </div>
      </header>

      {/* Navigation */}
      <nav className="px-8 py-2 border-b border-white/10 text-[0.75rem] tracking-[0.1em] uppercase shrink-0">
        <span className="text-[#5D5FEF] font-semibold">[01] INVENTARIS</span>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-8 flex flex-col gap-4 overflow-hidden">
        <div className="flex flex-col sm:flex-row gap-4 items-center shrink-0">
          <input
            type="text"
            placeholder="SEARCH SKU/CODE..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full flex-1 bg-white/5 border border-white/10 text-white p-3 rounded-none focus:outline-none focus:border-[#5D5FEF] font-mono text-sm transition-colors"
          />
          <button className="w-full sm:w-auto bg-[#5D5FEF] text-white border-none px-6 py-3 font-semibold rounded-none hover:bg-[#4b4cd1] transition-colors text-xs tracking-wider uppercase shrink-0">
            EXECUTE QUERY
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center border border-white/10 bg-white/5">
            <Loader2 className="w-8 h-8 text-[#5D5FEF] animate-spin mb-4" />
            <p className="text-white/60 font-mono text-xs uppercase tracking-widest">EXECUTING_QUERY...</p>
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center border border-white/10 bg-white/5 p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <h3 className="text-red-500 font-mono font-bold mb-2 uppercase">QUERY_FAILED</h3>
            <p className="text-white/60 text-xs font-mono mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-red-500 text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-red-600 transition-colors rounded-none"
            >
              RETRY_CONNECTION
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto border border-white/10 min-h-0 bg-[#111113]">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-[#151518] z-10 shadow-[0_1px_0_rgba(255,255,255,0.1)]">
                <tr>
                  <th className="bg-white/5 text-[0.65rem] uppercase tracking-[0.15em] p-4 text-white/80 w-[20%]">KODE</th>
                  <th className="bg-white/5 text-[0.65rem] uppercase tracking-[0.15em] p-4 text-white/80 w-[20%]">SKU ID</th>
                  <th className="bg-white/5 text-[0.65rem] uppercase tracking-[0.15em] p-4 text-white/80 w-[60%]">DESKRIPSI</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                {filteredData.length > 0 ? (
                  filteredData.map((item, index) => (
                    <tr key={index} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 border-t border-white/10 text-[0.9rem] text-[#5D5FEF]">
                        {item.kode}
                      </td>
                      <td className="px-4 py-3 border-t border-white/10 text-[0.9rem] text-[#EDEDED]">
                        {item.sku}
                      </td>
                      <td className="px-4 py-3 border-t border-white/10 text-[0.9rem] text-[#EDEDED] font-sans">
                        {item.deskripsi}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-4 py-12 text-center border-t border-white/10">
                      <div className="flex flex-col items-center">
                        <Package className="w-8 h-8 text-white/20 mb-3" />
                        <p className="text-white/40 font-mono text-xs uppercase tracking-widest">NO_RECORDS_FOUND</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <footer className="px-8 py-4 border-t border-white/10 flex justify-between items-center text-[0.6rem] uppercase text-white/40 font-mono tracking-wider shrink-0">
        <div>SYSTEM_READY_V2.4.0</div>
        <div className="flex items-center gap-4">
          <span>RECORDS: {filteredData.length}</span>
          <span className="hidden sm:inline">SERVER: ONLINE [LATENCY: 12MS]</span>
        </div>
      </footer>
    </div>
  );
}
