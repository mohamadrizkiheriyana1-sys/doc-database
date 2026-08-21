import { readFileSync, writeFileSync } from 'fs';
const path = 'src/components/InventoryDashboard.tsx';
let content = readFileSync(path, 'utf-8');

content = content.replace(
  `                </div>
              </div>                          ) : settingsTab === 'audit' ? (`,
  `                </div>
              </div>
              </>
            ) : settingsTab === 'audit' ? (`
);

writeFileSync(path, content);
