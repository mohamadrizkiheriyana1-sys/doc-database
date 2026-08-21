import { readFileSync, writeFileSync } from 'fs';

let appContent = readFileSync('src/App.tsx', 'utf-8');
appContent = appContent.replace(
  `const loggedIn = localStorage.getItem('gudangku_logged_in');`,
  `let loggedIn = 'false'; try { loggedIn = localStorage.getItem('gudangku_logged_in') || 'false'; } catch(e) {}`
);
appContent = appContent.replace(
  `localStorage.setItem('gudangku_logged_in', 'true');`,
  `try { localStorage.setItem('gudangku_logged_in', 'true'); } catch(e) {}`
);
appContent = appContent.replace(
  `localStorage.removeItem('gudangku_logged_in');`,
  `try { localStorage.removeItem('gudangku_logged_in'); } catch(e) {}`
);
writeFileSync('src/App.tsx', appContent);
console.log("App.tsx localStorage fixed.");

let dashContent = readFileSync('src/components/InventoryDashboard.tsx', 'utf-8');
dashContent = dashContent.replace(
  `const savedTheme = localStorage.getItem('theme');`,
  `let savedTheme = 'dark'; try { savedTheme = localStorage.getItem('theme') || 'dark'; } catch(e) {}`
);
dashContent = dashContent.replace(
  `localStorage.setItem('theme', 'dark');`,
  `try { localStorage.setItem('theme', 'dark'); } catch(e) {}`
);
dashContent = dashContent.replace(
  `localStorage.setItem('theme', 'light');`,
  `try { localStorage.setItem('theme', 'light'); } catch(e) {}`
);
writeFileSync('src/components/InventoryDashboard.tsx', dashContent);
console.log("InventoryDashboard.tsx localStorage fixed.");

