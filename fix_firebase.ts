import { readFileSync, writeFileSync } from 'fs';

let content = readFileSync('src/lib/firebase.ts', 'utf-8');

const target = `export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({tabManager: persistentMultipleTabManager()})
}, "ai-studio-gudangku-c84a7070-0f36-45de-b215-6d98ec409fcd");`;

const replace = `let dbInstance;
try {
  dbInstance = initializeFirestore(app, {
    localCache: persistentLocalCache({tabManager: persistentMultipleTabManager()})
  }, "ai-studio-gudangku-c84a7070-0f36-45de-b215-6d98ec409fcd");
} catch (err) {
  console.warn("Failed to initialize Firestore with persistence, falling back to default.", err);
  dbInstance = getFirestore(app, "ai-studio-gudangku-c84a7070-0f36-45de-b215-6d98ec409fcd");
}
export const db = dbInstance;`;

if (content.includes(target)) {
  content = content.replace(target, replace);
  writeFileSync('src/lib/firebase.ts', content);
  console.log("Firebase persistence fallback added.");
} else {
  console.log("Target not found in firebase.ts");
}
