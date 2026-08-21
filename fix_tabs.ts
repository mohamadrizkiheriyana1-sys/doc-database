import { readFileSync, writeFileSync } from 'fs';

const path = 'src/components/InventoryDashboard.tsx';
let content = readFileSync(path, 'utf-8');

// I will just re-clone the repository locally... No wait, I can just fix it.
// Let's replace the faulty end.
content = content.replace(
  `                  </div>
                </div>
                              </div>
              )}
            </div>
          ) : null}`,
  `                  </div>
                </div>
              </div>
              </div>
              )}
            </div>
          ) : null}`
);

writeFileSync(path, content);
