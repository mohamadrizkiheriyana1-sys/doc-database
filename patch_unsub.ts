import { readFileSync, writeFileSync } from 'fs';

const path = 'src/components/InventoryDashboard.tsx';
let content = readFileSync(path, 'utf-8');

content = content.replace(
  "      unsubRequests();\n    };\n  }, []);",
  "      unsubRequests();\n      unsubAudit();\n    };\n  }, []);"
);

writeFileSync(path, content);
