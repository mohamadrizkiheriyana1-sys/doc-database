import { readFileSync, writeFileSync } from 'fs';
const path = 'src/components/InventoryDashboard.tsx';
let content = readFileSync(path, 'utf-8');

const target = `                         <div className="opacity-50">NO_ACTIVE_SESSIONS_FOUND...</div>
                       )}
                    </div>
                  </div>
                </div>              
                </div>
              )}
            </div>
          ) : null}
        </main>
        {/* Footer */}
        <footer className="shrink-0 col-span-full border-t border-[var(--border-10)] flex items-center justify-between px-4 md:px-10 py-3 md:py-0 text-[0.6rem] opacity-50">
          <div>SYSTEM BUILD V2.4.0</div>
          <div className="cursor-pointer text-[var(--accent)] hover:opacity-100 transition-opacity" onClick={onLogout}>SHUTDOWN_SYS</div>
        </footer>
      </div>
    </div>
  );
}`;

const endStart = content.indexOf(`                         <div className="opacity-50">NO_ACTIVE_SESSIONS_FOUND...</div>`);
if (endStart !== -1) {
  content = content.slice(0, endStart) + target;
  writeFileSync(path, content);
}

