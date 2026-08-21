import { readFileSync, writeFileSync } from 'fs';
const path = 'src/components/InventoryDashboard.tsx';
let content = readFileSync(path, 'utf-8');

content = content.replace(
  `                    </div>
                  </div>
                </div>              
                </div>
              )}
            </div>
          ) : null}
        </main>`,
  `                    </div>
                  </div>
                </div>              
                </div>
                </div>
              )}
            </div>
          ) : null}
        </main>`
);
writeFileSync(path, content);
