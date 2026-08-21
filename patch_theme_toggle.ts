import { readFileSync, writeFileSync } from 'fs';

const path = 'src/components/InventoryDashboard.tsx';
let content = readFileSync(path, 'utf-8');

if (!content.includes('Sun, Moon')) {
  content = content.replace(
    'UserCircle, Key, Save } from \'lucide-react\';',
    'UserCircle, Key, Save, Sun, Moon } from \'lucide-react\';'
  );
}

// Add state
if (!content.includes('isDarkMode')) {
  const themeState = `  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return document.documentElement.classList.contains('dark');
    }
    return true;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);
`;
  content = content.replace(
    "const [settingsStatus, setSettingsStatus] = useState<{type: 'success' | 'error', msg: string} | null>(null);",
    "const [settingsStatus, setSettingsStatus] = useState<{type: 'success' | 'error', msg: string} | null>(null);\n" + themeState
  );
}

// Add toggle button to header
const oldHeaderRight = `            <div className="text-[0.6rem] uppercase text-[var(--text-main)] hidden sm:block">Node_07 / Active</div>
          </div>
        </header>`;

const newHeaderRight = `            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-1.5 border border-[var(--border-20)] hover:border-[var(--accent)] text-[var(--text-main)] hover:text-[var(--accent)] transition-colors"
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <div className="text-[0.6rem] uppercase text-[var(--text-main)] hidden sm:block">Node_07 / Active</div>
          </div>
        </header>`;

content = content.replace(oldHeaderRight, newHeaderRight);

writeFileSync(path, content);
