import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { initialState } from '../lib/study/engine';
import type { StudyState } from '../lib/study/types';
import { studyBank } from '../data/studyBank';

const key = 'mp6:study:v1';
let queue: Promise<unknown> = Promise.resolve();
async function redis(command: unknown[]) {
  const response = await fetch(process.env.UPSTASH_REDIS_REST_URL!, { method:'POST', headers:{ Authorization:`Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`, 'Content-Type':'application/json' }, body:JSON.stringify(command), signal:AbortSignal.timeout(10000), cache:'no-store' });
  if(!response.ok) throw new Error('Persistent storage unavailable.');
  const data = await response.json();
  if(data.error) throw new Error('Persistent storage command failed.');
  return data.result;
}
export async function transaction<T>(fn: (s: StudyState) => T): Promise<T> {
  if(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    for(let tries=0; tries<12; tries++) {
      const raw: string | null = await redis(['GET',key]);
      const state: StudyState = raw ? JSON.parse(raw) : initialState(studyBank);
      const result = fn(state);
      const next = JSON.stringify(state);
      if(next.length > 8_000_000) throw new Error('Storage limit reached. Export and archive this study.');
      const saved = await redis(['EVAL',"local old=redis.call('GET',KEYS[1]); if (old or '')==ARGV[1] then redis.call('SET',KEYS[1],ARGV[2]); return 1 else return 0 end",1,key,raw ?? '',next]);
      if(saved === 1) return result;
    }
    throw new Error('Storage busy; please retry.');
  }
  if(process.env.VERCEL) throw new Error('Persistent storage is not configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.');
  const job = queue.then(async () => {
    const dir = process.env.STUDY_DATA_DIR || path.join(process.cwd(),'.research-data');
    await mkdir(dir,{recursive:true});
    const file = path.join(dir,'study.json');
    let state: StudyState;
    try { state = JSON.parse(await readFile(file,'utf8')); }
    catch(e) { if((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e; state=initialState(studyBank); }
    const result=fn(state);
    await writeFile(`${file}.tmp`,JSON.stringify(state),{mode:0o600});
    await rename(`${file}.tmp`,file);
    return result;
  });
  queue=job.catch(()=>{});
  return job;
}
