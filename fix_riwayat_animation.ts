import { readFileSync, writeFileSync } from 'fs';
const path = 'src/components/InventoryDashboard.tsx';
let content = readFileSync(path, 'utf-8');

const targetStr = `                      requestHistory.map((req, idx) => (
                        <div key={idx} className={\`p-4 border-b border-white/5 flex flex-col gap-2 transition-colors \${editingRequestIndex === idx ? 'bg-[var(--accent)]/5 border-l-2 border-l-[#00f2ff]' : ''}\`}>`;

const replacementStr = `                      <AnimatePresence initial={false}>
                      {requestHistory.map((req, idx) => (
                        <motion.div 
                          layout
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.3 }}
                          key={req.sku + idx} 
                          className={\`p-4 border-b border-white/5 flex flex-col gap-2 transition-colors \${editingRequestIndex === idx ? 'bg-[var(--accent)]/5 border-l-2 border-l-[#00f2ff]' : ''}\`}
                        >`;

const targetStrEnd = `                          <div className="text-[9px] opacity-40 mt-1 uppercase">QTY: {req.qty} • {req.alasan}</div>
                        </div>
                      ))
                    ) : (`;

const replacementStrEnd = `                          <div className="text-[9px] opacity-40 mt-1 uppercase">QTY: {req.qty} • {req.alasan}</div>
                        </motion.div>
                      ))}
                      </AnimatePresence>
                    ) : (`;

if (content.includes(targetStr) && content.includes(targetStrEnd)) {
  content = content.replace(targetStr, replacementStr);
  content = content.replace(targetStrEnd, replacementStrEnd);
  writeFileSync(path, content);
  console.log("Successfully added layout animation to request history items.");
} else {
  console.log("Target string not found.");
}
