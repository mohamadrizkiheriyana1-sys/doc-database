import { readFileSync, writeFileSync } from 'fs';
const path = 'src/components/InventoryDashboard.tsx';
let content = readFileSync(path, 'utf-8');

const targetStr = `                          <motion.tr 
                            key={item.id || item.kode + index}
                            initial={{ opacity: 0, y: -10, backgroundColor: 'rgba(0, 242, 255, 0.2)' }}
                            animate={{ opacity: 1, y: 0, backgroundColor: 'transparent' }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.3 }}`;

const replacementStr = `                          <motion.tr 
                            layout
                            key={item.id || item.kode + index}
                            initial={{ opacity: 0, y: -10, backgroundColor: 'rgba(0, 242, 255, 0.2)' }}
                            animate={{ opacity: 1, y: 0, backgroundColor: 'transparent' }}
                            exit={{ opacity: 0, scale: 0.9, backgroundColor: 'rgba(255, 50, 50, 0.2)' }}
                            transition={{ duration: 0.3, layout: { duration: 0.3 } }}`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replacementStr);
  writeFileSync(path, content);
  console.log("Successfully added layout animation to inventory items.");
} else {
  console.log("Target string not found. Trying another way...");
}
