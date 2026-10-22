import { randomBytes } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
const content=`ADMIN_PASSWORD=${randomBytes(18).toString('base64url')}\nSESSION_SECRET=${randomBytes(48).toString('base64url')}\nGEMINI_API_KEY=\nGEMINI_MODEL=gemini-2.5-flash\nAPP_ORIGIN=http://localhost:3000\nFRONTEND_ORIGIN=https://qthlpy-collab.github.io\nUPSTASH_REDIS_REST_URL=\nUPSTASH_REDIS_REST_TOKEN=\n`;
try{await writeFile('.env.local',content,{flag:'wx',mode:0o600});console.log('Created .env.local with random administrator credentials. Open this local file to find ADMIN_PASSWORD and add GEMINI_API_KEY. This file is excluded from Git.');}
catch(e){if((e as NodeJS.ErrnoException).code==='EEXIST')console.log('.env.local already exists and has been preserved.');else throw e;}
