import { readFileSync, writeFileSync } from 'fs';
const path = 'src/components/InventoryDashboard.tsx';
let content = readFileSync(path, 'utf-8');

// Fix profile ending
content = content.replace(
  `                </div>
              </div>                          ) : settingsTab === 'audit' ? (`,
  `                </div>
              </div>
              </>
            ) : settingsTab === 'audit' ? (`
);

// Fix audit ending
content = content.replace(
  `                  </div>
                )}
              </div>
            ) : (`,
  `                  </div>
                )}
              </div>
              </>
            ) : (`
);

// Check if settings has the <></> wrapped.
if (!content.includes('</>\n            ) : settingsTab === \'audit\'')) {
  console.log("Profile not fixed.");
}

writeFileSync(path, content);
