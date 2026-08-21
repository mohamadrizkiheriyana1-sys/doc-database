import { readFileSync, writeFileSync } from 'fs';

const path = 'src/components/InventoryDashboard.tsx';
let content = readFileSync(path, 'utf-8');

// Add import for PapaParse
if (!content.includes("import Papa from 'papaparse';")) {
  content = content.replace(
    "import * as XLSX from 'xlsx';",
    "import * as XLSX from 'xlsx';\nimport Papa from 'papaparse';"
  );
}

// Add the handleExportInventoryCSV function before handleDownloadExcel
const handleDownloadExcelStr = "  const handleDownloadExcel = () => {";
const exportCsvStr = `  const handleExportInventoryCSV = () => {
    if (filteredData.length === 0) {
      alert('Tidak ada data untuk diekspor');
      return;
    }
    
    // Prepare data for export
    const csvData = filteredData.map(item => ({
      'KODE': item.kode,
      'SKU ID': item.sku,
      'DESKRIPSI': item.deskripsi
    }));
    
    const csvString = Papa.unparse(csvData);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', \`Inventory_Export_\${new Date().getTime()}.csv\`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

`;

if (!content.includes('handleExportInventoryCSV')) {
  content = content.replace(handleDownloadExcelStr, exportCsvStr + handleDownloadExcelStr);
}

// Add the export button next to the search input
const searchInputBlock = `              <div className="flex flex-col sm:flex-row gap-[10px] shrink-0">
                <input
                  type="text"
                  placeholder="QUERY_ID_OR_SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-black/50 border border-[rgba(236,236,236,0.2)] text-[#ececec] p-[10px_15px] text-[0.75rem] uppercase tracking-widest outline-none focus:border-[#00f2ff] transition-colors w-full sm:max-w-md placeholder:text-[rgba(236,236,236,0.3)]"
                />
              </div>`;

const searchInputBlockWithButton = `              <div className="flex flex-col sm:flex-row gap-[10px] shrink-0 justify-between items-start sm:items-center">
                <input
                  type="text"
                  placeholder="QUERY_ID_OR_SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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
