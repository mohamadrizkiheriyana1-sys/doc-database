const csv = `"Kode","sku","Deskripsi Part"\n"2054","202305242054","Part"\n"2054","202305242054-B","Tongkat Atas"`;
const rows = csv.split('\n').map(row => {
  // basic csv split
  return row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)?.map(col => col.replace(/^"|"$/g, '')) || [];
});
console.log(rows);
