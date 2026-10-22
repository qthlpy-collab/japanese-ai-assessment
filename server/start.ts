import { createServer } from 'node:http';
import next from 'next';
import nextEnv from '@next/env';
import { handleApi } from './http';
nextEnv.loadEnvConfig(process.cwd());
const dev=process.argv.includes('--dev');
const port=Number(process.env.PORT || 3000);
const app=next({dev,port,hostname:'0.0.0.0'});
await app.prepare();
const handle=app.getRequestHandler();
createServer((req,res)=>{
  if(req.url?.split('?')[0]==='/api/research')void handleApi(req,res);
  else void handle(req,res);
}).listen(port,'0.0.0.0',()=>console.log(`MP6 ready: http://localhost:${port}/exam/ | Admin: http://localhost:${port}/admin/`));
