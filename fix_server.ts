import { readFileSync, writeFileSync } from 'fs';

let content = readFileSync('server.ts', 'utf-8');

if (content.includes('app.get("*all",')) {
  content = content.replace('app.get("*all",', 'app.get("*",');
  writeFileSync('server.ts', content);
  console.log("Fixed wildcard route in server.ts");
}

