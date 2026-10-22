import type { IncomingMessage, ServerResponse } from 'node:http';
import { dispatch } from './service';

export async function handleApi(req: IncomingMessage & { body?: unknown }, res: ServerResponse) {
  const origin=req.headers.origin;
  const allowed=[process.env.APP_ORIGIN,process.env.FRONTEND_ORIGIN,'http://localhost:3000','http://127.0.0.1:3000'].filter(Boolean);
  res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Content-Type','application/json; charset=utf-8');
  if(origin && !allowed.includes(origin)) {res.statusCode=403;res.end(JSON.stringify({error:'Origin not allowed. Set APP_ORIGIN / FRONTEND_ORIGIN.'}));return;}
  if(origin){res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Vary','Origin');}
  if(req.method==='OPTIONS'){res.setHeader('Access-Control-Allow-Methods','POST, OPTIONS');res.setHeader('Access-Control-Allow-Headers','Content-Type, Authorization');res.statusCode=204;res.end();return;}
  if(req.method!=='POST'){res.statusCode=405;res.end(JSON.stringify({error:'Use POST.'}));return;}
  try {
    if(!req.headers['content-type']?.startsWith('application/json'))throw new Error('JSON request required.');
    let input:unknown=req.body;
    if(input===undefined){let raw='';for await(const chunk of req){raw+=chunk.toString();if(Buffer.byteLength(raw)>200000){res.statusCode=413;res.end(JSON.stringify({error:'Request too large.'}));return;}}input=JSON.parse(raw);}
    if(typeof input==='string')input=JSON.parse(input);
    if(!input || typeof input!=='object' || Array.isArray(input))throw new Error('Invalid JSON object.');
    const token=(req.headers.authorization ?? '').replace(/^Bearer /,'');
    const result=await dispatch(input as Record<string,unknown>,token,String(req.headers['x-real-ip'] ?? req.socket.remoteAddress ?? 'unknown'));
    res.end(JSON.stringify(result));
  } catch(e){res.statusCode=400;res.end(JSON.stringify({error:e instanceof Error ? e.message:'Request failed.'}));}
}
