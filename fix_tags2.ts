import { readFileSync, writeFileSync } from 'fs';
const path = 'src/components/InventoryDashboard.tsx';
let content = readFileSync(path, 'utf-8');
const search = `                </div>
                              </div>
              )}
            </div>
          ) : null}`;
const replace = `                  </div>
                </div>
              </div>
              )}
            </div>
          ) : null}`;
console.log("Replacing: ", content.includes(search));
if(content.includes(search)) {
  writeFileSync(path, content.replace(search, replace));
}
