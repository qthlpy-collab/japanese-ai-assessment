import { defineConfig } from '@playwright/test';
import path from 'node:path';
export default defineConfig({
  testDir:'./e2e',fullyParallel:false,workers:1,timeout:90000,
  use:{baseURL:'http://localhost:3100',channel:'msedge',headless:true,trace:'retain-on-failure'},
  projects:[{name:'desktop',use:{viewport:{width:1440,height:1000}}},{name:'mobile',use:{viewport:{width:390,height:844}}}],
  webServer:{command:'npm run dev',url:'http://localhost:3100',timeout:120000,reuseExistingServer:false,env:{PORT:'3100',NEXT_DEV_DIR:'.next-e2e',APP_ORIGIN:'http://localhost:3100',ADMIN_PASSWORD:'browser-test-password-only',SESSION_SECRET:'browser-test-session-secret-longer-than-32-chars',STUDY_DATA_DIR:path.join(process.cwd(),'.research-data',`browser-${Date.now()}`),GEMINI_API_KEY:''}},
});
