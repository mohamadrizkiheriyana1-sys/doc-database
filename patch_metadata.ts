import { readFileSync, writeFileSync } from 'fs';
const path = 'metadata.json';
let data = JSON.parse(readFileSync(path, 'utf-8'));
if (!data.requestFramePermissions) {
  data.requestFramePermissions = [];
}
if (!data.requestFramePermissions.includes('camera')) {
  data.requestFramePermissions.push('camera');
}
writeFileSync(path, JSON.stringify(data, null, 2));
