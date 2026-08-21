import { readFileSync, writeFileSync } from 'fs';
const path = 'src/components/InventoryDashboard.tsx';
let content = readFileSync(path, 'utf-8');

// Profile fix
content = content.replace(
  `                </div>
              </div>                          ) : settingsTab === 'audit' ? (`,
  `                </div>
              </div>
              </>
            ) : settingsTab === 'audit' ? (`
);

// Audit fix
content = content.replace(
  `                  </div>
                )}                            ) : (`,
  `                  </div>
                )}
              </div>
              </>
            ) : (`
);

writeFileSync(path, content);
