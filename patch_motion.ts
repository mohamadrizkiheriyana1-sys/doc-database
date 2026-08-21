import { readFileSync, writeFileSync } from 'fs';

const path = 'src/components/InventoryDashboard.tsx';
let content = readFileSync(path, 'utf-8');

// Add import if not present
if (!content.includes("from 'motion/react'")) {
  content = content.replace(
    "import React, { useState, useEffect, useMemo, useRef } from 'react';",
    "import React, { useState, useEffect, useMemo, useRef } from 'react';\nimport { motion, AnimatePresence } from 'motion/react';"
  );
}

const oldTbody = `                    <tbody>
                      {filteredData.length > 0 ? (
                        filteredData.map((item, index) => {
                          const isEditing = editingItem === item.id && item.id;
                          return (
                          <tr key={item.id || index}>`;

const newTbody = `                    <tbody>
                      <AnimatePresence initial={false}>
                      {filteredData.length > 0 ? (
                        filteredData.map((item, index) => {
                          const isEditing = editingItem === item.id && item.id;
                          return (
                          <motion.tr 
                            key={item.id || item.kode + index}
                            initial={{ opacity: 0, y: -10, backgroundColor: 'rgba(0, 242, 255, 0.2)' }}
                            animate={{ opacity: 1, y: 0, backgroundColor: 'transparent' }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.3 }}
                          >`;

content = content.replace(oldTbody, newTbody);

const oldClosing = `                          </tr>
                        )})
                      ) : (
                        <tr>`;

const newClosing = `                          </motion.tr>
                        )})
                      ) : (
                        <motion.tr
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >`;

content = content.replace(oldClosing, newClosing);

const oldEmptyEnd = `                          </td>
                        </tr>
                      )}
                    </tbody>`;

const newEmptyEnd = `                          </td>
                        </motion.tr>
                      )}
                      </AnimatePresence>
                    </tbody>`;

content = content.replace(oldEmptyEnd, newEmptyEnd);

writeFileSync(path, content);
