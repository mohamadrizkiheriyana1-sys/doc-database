import { readFileSync, writeFileSync } from 'fs';

// 1. Update index.css
let css = readFileSync('src/index.css', 'utf-8');
const newCss = `@import "tailwindcss";

@theme {
  --font-mono: "Space Mono", monospace;
  --font-sans: "Inter", sans-serif;
}

:root {
  --bg-main: #ffffff;
  --bg-panel: #f8f9fa;
  --text-main: #111113;
  --text-inverse: #ececec;
  --accent: #0066cc; 
  --border-10: rgba(17, 17, 19, 0.1);
  --border-20: rgba(17, 17, 19, 0.2);
  --border-30: rgba(17, 17, 19, 0.3);
  --border-05: rgba(17, 17, 19, 0.05);
  --overlay-90: rgba(255, 255, 255, 0.9);
  --overlay-80: rgba(255, 255, 255, 0.8);
  --overlay-50: rgba(17, 17, 19, 0.05);
  --overlay-30: rgba(17, 17, 19, 0.03); 
  --overlay-20: rgba(17, 17, 19, 0.02);
  --white-02: rgba(0, 0, 0, 0.02);
}

.dark {
  --bg-main: #111113;
  --bg-panel: #000000;
  --text-main: #ececec;
  --text-inverse: #111113;
  --accent: #00f2ff;
  --border-10: rgba(236, 236, 236, 0.1);
  --border-20: rgba(236, 236, 236, 0.2);
  --border-30: rgba(236, 236, 236, 0.3);
  --border-05: rgba(236, 236, 236, 0.05);
  --overlay-90: rgba(0, 0, 0, 0.9);
  --overlay-80: rgba(0, 0, 0, 0.8);
  --overlay-50: rgba(0, 0, 0, 0.5);
  --overlay-30: rgba(0, 0, 0, 0.3);
  --overlay-20: rgba(0, 0, 0, 0.2);
  --white-02: rgba(255, 255, 255, 0.02);
}

::selection {
  background: var(--accent);
  color: var(--text-inverse);
}

body {
  background-color: var(--bg-main);
  color: var(--text-main);
}

.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
`;
writeFileSync('src/index.css', newCss);

// 2. Update tsx files
const files = ['src/components/InventoryDashboard.tsx', 'src/components/BarcodeScanner.tsx'];

for (const file of files) {
  let content = readFileSync(file, 'utf-8');
  content = content.replace(/bg-\[#111113\]/g, 'bg-[var(--bg-main)]');
  content = content.replace(/text-\[#111113\]/g, 'text-[var(--text-inverse)]');
  content = content.replace(/text-\[#ececec\]/g, 'text-[var(--text-main)]');
  content = content.replace(/bg-\[#00f2ff\]/g, 'bg-[var(--accent)]');
  content = content.replace(/text-\[#00f2ff\]/g, 'text-[var(--accent)]');
  content = content.replace(/border-\[#00f2ff\]/g, 'border-[var(--accent)]');
  
  content = content.replace(/border-\[rgba\(236,236,236,0\.1\)\]/g, 'border-[var(--border-10)]');
  content = content.replace(/border-\[rgba\(236,236,236,0\.2\)\]/g, 'border-[var(--border-20)]');
  content = content.replace(/border-\[rgba\(236,236,236,0\.3\)\]/g, 'border-[var(--border-30)]');
  content = content.replace(/border-\[rgba\(236,236,236,0\.05\)\]/g, 'border-[var(--border-05)]');

  content = content.replace(/bg-black\/90/g, 'bg-[var(--overlay-90)]');
  content = content.replace(/bg-black\/80/g, 'bg-[var(--overlay-80)]');
  content = content.replace(/bg-black\/50/g, 'bg-[var(--overlay-50)]');
  content = content.replace(/bg-black\/30/g, 'bg-[var(--overlay-30)]');
  content = content.replace(/bg-black\/20/g, 'bg-[var(--overlay-20)]');
  content = content.replace(/bg-white\/\[0\.02\]/g, 'bg-[var(--white-02)]');
  
  content = content.replace(/\bbg-black\b(?![\/\w])/g, 'bg-[var(--bg-panel)]');

  writeFileSync(file, content);
}
