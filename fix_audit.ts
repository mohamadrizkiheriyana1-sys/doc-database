import { readFileSync, writeFileSync } from 'fs';
const path = 'src/components/InventoryDashboard.tsx';
let content = readFileSync(path, 'utf-8');

const target = `                  </div>
                )}
              </div>
            ) : (`;

content = content.replace(
  `                  </div>
                )}                            ) : (`,
  target
);

writeFileSync(path, content);
