import Papa from 'papaparse';

export async function getSpreadsheetData(spreadsheetId: string) {
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Gagal mengambil data dari spreadsheet.');
  }
  
  const csvText = await response.text();
  
  return new Promise<string[][]>((resolve, reject) => {
    Papa.parse<string[]>(csvText, {
      complete: (results) => {
        resolve(results.data);
      },
      error: (error: any) => {
        reject(error);
      }
    });
  });
}

