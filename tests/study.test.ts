import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { studyBank } from '../data/studyBank';
import { initialState, objectiveScore, publicView, validateBank, validateQuestion, validateSurvey, attemptScores, exportRows } from '../lib/study/engine';
import { dispatch } from '../server/service';
import { transaction } from '../server/store';
import type { LearnerView, Attempt } from '../lib/study/types';
import { wilcoxonSignedRank } from '../lib/statistics/wilcoxon';

describe('study measurement',()=>{
  it('has three complete, validated parallel blueprints',()=>{expect(studyBank).toHaveLength(45);expect(()=>validateBank(studyBank)).not.toThrow();});
  it('does not award keyword or length points to writing',()=>{const q=studyBank.find(q=>q.kind==='writing')!;expect(objectiveScore(q,'です ます 研究 '.repeat(30))).toBeNull();});
  it('normalizes recall answers and queues other spellings for review',()=>{const q=studyBank.find(q=>q.kind==='recall')!;expect(objectiveScore(q,` ${q.answers[0]}。`)).toBe(4);expect(objectiveScore(q,'よやく')).toBeNull();expect(objectiveScore(q,'')).toBe(0);});
  it('validates choice answers and does not accept default unanswered surveys',()=>{expect(()=>validateQuestion({...studyBank[0],answers:['invalid']})).toThrow();expect(()=>validateSurvey({})).toThrow();});
  it('keeps incomplete submissions missing rather than fabricated zero',()=>{const s=initialState(studyBank);s.learners.push({id:'P01',tokenHash:'secret',formOrder:['A','B','C'],condition:'fixed',attempts:{},feedback:[]});const row=exportRows(s)[0];expect(row.grammarPre).toBeNull();expect(row.responseTimePost).toBeNull();const v=publicView(s.learners[0],s);expect(JSON.stringify(v)).not.toContain('tokenHash');});
  it('uses exact sign randomization for small samples including ties and zeros',()=>{const r=wilcoxonSignedRank([0,0,0,0,1],[1,1,1,1,1]);expect(r.n).toBe(4);expect(r.pValue).toBe(.125);expect(r.z).toBe(2);expect(r.method).toContain('Exact');expect(wilcoxonSignedRank([0,0],[1,-1]).pValue).toBe(1);});
});

describe('authenticated collection workflow',()=>{
  let dir:string,admin:string,code:string;
  beforeAll(async()=>{dir=await mkdtemp(path.join(tmpdir(),'mp6-test-'));process.env.STUDY_DATA_DIR=dir;process.env.ADMIN_PASSWORD='test-admin-password-long';process.env.SESSION_SECRET='test-session-secret-longer-than-thirty-two-characters';delete process.env.UPSTASH_REDIS_REST_URL;delete process.env.VERCEL;
    const login=await dispatch({op:'admin.login',password:process.env.ADMIN_PASSWORD},'') as {token:string};admin=login.token;
    const invites=await dispatch({op:'admin.invite',count:1,condition:'fixed'},admin) as {invites:{code:string}[]};code=invites.invites[0].code;
  });
  afterAll(async()=>{await rm(dir,{recursive:true,force:true});delete process.env.STUDY_DATA_DIR;});
  it('rejects unauthenticated administration and invalid participant tokens',async()=>{await expect(dispatch({op:'admin.state'},'')).rejects.toThrow();await expect(dispatch({op:'learner.me'},'invalid')).rejects.toThrow();});
  it('requires consent and prevents skipping intervention',async()=>{await expect(dispatch({op:'learner.start',stage:'Pre'},code)).rejects.toThrow();await dispatch({op:'learner.consent',consent:true,profile:{ageGroup:'18-24',japaneseLevel:'N4',aiExperience:'None'}},code);await expect(dispatch({op:'learner.start',stage:'Post'},code)).rejects.toThrow();});
  it('snapshots questions, withholds answers and resumes the same attempt',async()=>{const a=await dispatch({op:'learner.start',stage:'Pre'},code) as LearnerView;expect(a.attempts.Pre!.questions).toHaveLength(15);expect(JSON.stringify(a.attempts.Pre!.questions)).not.toContain('reference');expect(a.attempts.Pre!.questions[0]).not.toHaveProperty('answers');const b=await dispatch({op:'learner.start',stage:'Pre'},code) as LearnerView;expect(b.attempts.Pre!.id).toBe(a.attempts.Pre!.id);await expect(dispatch({op:'admin.publish',question:studyBank[0],replaceId:studyBank[0].id},admin)).rejects.toThrow();});
  it('saves drafts, prevents stale writes and makes final submission immutable',async()=>{const v=await dispatch({op:'learner.me'},code) as LearnerView;const answers=Object.fromEntries(v.attempts.Pre!.questions.map(q=>[q.id,q.kind==='choice'?q.options![0]:'練習回答です。']));const saved=await dispatch({op:'learner.save',stage:'Pre',answers,updatedAt:v.attempts.Pre!.updatedAt},code) as LearnerView;
    await expect(dispatch({op:'learner.save',stage:'Pre',answers,updatedAt:'outdated'},code)).rejects.toThrow();
    const result=await dispatch({op:'learner.submit',stage:'Pre',answers,updatedAt:saved.attempts.Pre!.updatedAt},code) as LearnerView;expect(result.attempts.Pre!.submittedAt).toBeTruthy();
    const again=await dispatch({op:'learner.submit',stage:'Pre',answers:{}},code) as LearnerView;expect(again.attempts.Pre!.answers).toEqual(answers);
  });
  it('exports pending human review as missing and validates ratings',async()=>{const a=await transaction(s=>s.learners[0].attempts.Pre!) as Attempt;expect(attemptScores(a).conversation).toBeNull();const q=a.questions.find(q=>q.kind==='writing')!;await expect(dispatch({op:'admin.grade',id:'P01',stage:'Pre',questionId:q.id,score:5,rater:'R1'},admin)).rejects.toThrow();await dispatch({op:'admin.grade',id:'P01',stage:'Pre',questionId:q.id,score:3,rater:'R1',note:'Task mostly met'},admin);const current=await transaction(s=>s.learners[0].attempts.Pre!);expect(current.scores[q.id]).toBe(3);});
  it('logs fixed feedback, limits turns and enforces learning duration',async()=>{
    await dispatch({op:'learner.learningStart'},code);
    const first=await dispatch({op:'learner.feedback',taskId:'L1',answer:'教室で勉強します。'},code) as LearnerView;expect(first.feedback[0].model).toBe('fixed-material-v1');
    await expect(dispatch({op:'learner.feedback',taskId:'L2',answer:'先生にメールを送りました。'},code)).rejects.toThrow();
    for(const taskId of ['L2','L3','L4','L5','L6']){await transaction(s=>{s.audit=s.audit.filter(a=>a.action!=='feedback.request');});await dispatch({op:'learner.feedback',taskId,answer:'練習回答です。'},code);}
    await expect(dispatch({op:'learner.learningFinish'},code)).rejects.toThrow();await transaction(s=>{s.learners[0].learningStartedAt=new Date(Date.now()-121*60000).toISOString();});
    const finished=await dispatch({op:'learner.learningFinish'},code) as LearnerView;expect(finished.learningCompletedAt).toBeTruthy();
  });
  it('does not publish drafts when the online API is unconfigured',async()=>{delete process.env.GEMINI_API_KEY;await expect(dispatch({op:'admin.generate',topic:'particles',form:'A',dimension:'grammar'},admin)).rejects.toThrow('GEMINI_API_KEY');expect((await transaction(s=>s.drafts)).length).toBe(0);});
  it('does not accept late answer changes after the server deadline',async()=>{await transaction(s=>{const l=s.learners[0];l.learningCompletedAt=new Date().toISOString();l.attempts.Post=structuredClone(l.attempts.Pre!);delete l.attempts.Post.submittedAt;l.attempts.Post.stage='Post';l.attempts.Post.answers={};l.attempts.Post.deadline=new Date(Date.now()-1000).toISOString();});const r=await dispatch({op:'learner.submit',stage:'Post',answers:{injected:'late'}},code) as LearnerView;expect(r.attempts.Post!.timedOut).toBe(true);expect(r.attempts.Post!.answers).toEqual({});});
  it('retains raw data without a delayed test and permits withdrawal',async()=>{const s=await transaction(s=>s);expect(exportRows(s)[0].grammarDelayed).toBeNull();await dispatch({op:'admin.withdraw',id:'P01'},admin);await expect(dispatch({op:'learner.me'},code)).rejects.toThrow();expect((await transaction(s=>s.learners)).length).toBe(0);});
});
