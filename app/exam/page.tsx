'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, LogOut, RefreshCw, Send, Save } from 'lucide-react';
import { learningTasks, questionnairePrompts } from '@/data/learningTasks';
import { callApi } from '@/lib/study/client';
import { type LearnerView, type Stage } from '@/lib/study/types';

const labels:Record<Stage,string>={Pre:'前测',Post:'即时后测',Delayed:'延迟后测'};
const names:Record<string,string>={vocabularyRecognition:'词汇识别',vocabularyRecall:'词汇回忆',contextualUsage:'语境表达',conversation:'文字对话应答',grammar:'助词与语法'};
const storageKey='mp6-learner-code-v2';
const clock=(s:number)=>`${String(Math.floor(Math.max(0,s)/60)).padStart(2,'0')}:${String(Math.floor(Math.max(0,s)%60)).padStart(2,'0')}`;

export default function ExamPage(){
  const [code,setCode]=useState(''),[view,setView]=useState<LearnerView|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);
  const [screen,setScreen]=useState<'home'|'exam'|'learning'|'survey'>('home'),[stage,setStage]=useState<Stage>('Pre');
  const [answers,setAnswers]=useState<Record<string,string>>({}),[index,setIndex]=useState(0),[saved,setSaved]=useState(''),[time,setTime]=useState(Date.now());
  const [profile,setProfile]=useState({ageGroup:'',japaneseLevel:'',aiExperience:''}),[consent,setConsent]=useState(false);
  const [responses,setResponses]=useState<Record<string,number>>({}),[task,setTask]=useState(0),[practice,setPractice]=useState('');
  const pending=useRef<Promise<unknown>>(Promise.resolve()),latest=useRef(answers),dirty=useRef(false),revision=useRef<string|undefined>(undefined),timeoutId=useRef(''),submitting=useRef(false);
  const active=view?.attempts[stage];
  const api=useCallback(<T,>(op:string,data:Record<string,unknown>={})=>callApi<T>(op,data,code),[code]);
  const run=async(fn:()=>Promise<void>)=>{setBusy(true);setError('');try{await fn();}catch(e){setError(e instanceof Error?e.message:'操作失败，请重试。');}finally{setBusy(false);}};
  useEffect(()=>{setCode(localStorage.getItem(storageKey)||'');const t=setInterval(()=>setTime(Date.now()),1000);return()=>clearInterval(t);},[]);
  useEffect(()=>{const handler=(e:BeforeUnloadEvent)=>{if(dirty.current)e.preventDefault();};window.addEventListener('beforeunload',handler);return()=>window.removeEventListener('beforeunload',handler);},[]);
  const openExam=(next:LearnerView,s:Stage)=>{
    const a=next.attempts[s];if(!a)return;let values=a.answers;
    try{const cached=JSON.parse(localStorage.getItem(`mp6-draft-${a.id}`)||'null');if(cached&&cached.at>Date.parse(a.updatedAt)&&!a.submittedAt)values=cached.answers;}catch{}
    latest.current=values;setAnswers(values);dirty.current=JSON.stringify(values)!==JSON.stringify(a.answers);revision.current=a.updatedAt;setIndex(0);setStage(s);setScreen('exam');setSaved('已恢复答卷');
  };
  const save=useCallback(async()=>{
    const a=view?.attempts[stage];if(!a||a.submittedAt||!dirty.current||submitting.current)return;const values={...latest.current};setSaved('正在保存…');
    const next=await api<LearnerView>('learner.save',{stage,answers:values,updatedAt:revision.current});revision.current=next.attempts[stage]?.updatedAt;
    if(JSON.stringify(values)===JSON.stringify(latest.current))dirty.current=false;setSaved('已保存到服务器');
    if(next.attempts[stage]?.submittedAt){setView(next);setScreen('home');}
  },[view,stage,api]);
  useEffect(()=>{if(screen!=='exam')return;const t=setInterval(()=>{pending.current=pending.current.catch(()=>{}).then(save).catch(e=>{setSaved('未同步，答案已在本机暂存');setError(e.message);});},2000);return()=>clearInterval(t);},[screen,save]);
  const change=(id:string,value:string)=>{const values={...latest.current,[id]:value};latest.current=values;setAnswers(values);dirty.current=true;setSaved('待同步');if(active)try{localStorage.setItem(`mp6-draft-${active.id}`,JSON.stringify({answers:values,at:Date.now()}));}catch{setError('本机暂存失败，请保持网络连接。');}};
  const submit=async(auto=false)=>{
    if(!active||active.submittedAt)return;
    if(!auto&&active.questions.some(q=>!latest.current[q.id]?.trim())){setError('请完成全部题目后再提交。');return;}
    if(!auto&&!window.confirm('提交后无法修改答案。确认提交吗？'))return;
    submitting.current=true;
    await run(async()=>{await pending.current.catch(()=>{});const next=await api<LearnerView>('learner.submit',{stage,answers:latest.current,updatedAt:revision.current});dirty.current=false;localStorage.removeItem(`mp6-draft-${active.id}`);setView(next);setScreen('home');});
    submitting.current=false;
  };
  useEffect(()=>{if(screen==='exam'&&active&&!active.submittedAt&&time>=Date.parse(active.deadline)&&!busy&&timeoutId.current!==active.id){timeoutId.current=active.id;void submit(true);}},[time,screen,active,busy]);
  const start=(s:Stage)=>run(async()=>{const next=await api<LearnerView>('learner.start',{stage:s});setView(next);openExam(next,s);});
  const logout=()=>{if(dirty.current&&!window.confirm('有未同步答案。确认退出？同一浏览器可恢复。'))return;localStorage.removeItem(storageKey);setView(null);setScreen('home');setCode('');};
  return <div className="exam-site" lang="zh-CN"><header className="exam-top"><div><strong>日语学习研究 · 考试与学习系统</strong><span>MP6 / 中国背景日语学习者</span></div><Link href="/admin">研究者入口</Link></header><main className="exam-main">
    {error&&<div className="exam-error" role="alert">{error}</div>}
    {!view?<section className="exam-box login-box"><h1>参与者登录</h1><p>请输入研究者发给你的参与码，在安静的环境中独立完成测试。</p><form onSubmit={e=>{e.preventDefault();void run(async()=>{const next=await callApi<LearnerView>('learner.me',{},code.trim());localStorage.setItem(storageKey,code.trim());setCode(code.trim());setView(next);});}}><label>参与码<input autoComplete="off" required value={code} onChange={e=>setCode(e.target.value)}/></label><button disabled={busy||!code.trim()}>{busy?'正在连接…':'进入研究'}</button></form><p className="exam-note">参与码仅用于本次研究，请勿分享。没有参与码请联系研究者。</p></section>:<>
      <div className="exam-toolbar"><span>参与者：{view.id}</span><span>{screen==='exam'?labels[stage]:'研究进度'}</span><button disabled={busy} onClick={()=>run(async()=>{setView(await api('learner.me'));})}><RefreshCw size={15}/>刷新</button><button onClick={logout}><LogOut size={15}/>退出</button></div>
      {!view.consentAt?<section className="exam-box"><h1>研究说明与知情同意</h1><p>本研究比较不同反馈方式对中国背景学习者独立日语表现的影响，包含前测、约 {view.settings.learningMinutes} 分钟学习、即时后测和 {view.settings.delayedDays} 天后的延迟后测。每次测试限时 {view.settings.examMinutes} 分钟。</p><p>系统收集参与编号、年龄组、日语水平、答题文本、作答时间、学习反馈记录和问卷，不需要姓名、邮箱或学号。数据保存在研究服务器。学习环节使用在线 AI 时，去除参与编号的练习文本会发送给 Google Gemini，请勿输入个人信息。对话题为文字应答，不测量口语发音。</p><p>参与自愿，可随时停止。需要撤回数据时，请通过招募时的联系方式联系研究负责人廖鹏宇，并提供参与编号。测试时请关闭 AI、词典和翻译工具，学习环节仅使用本系统的材料与反馈。本测试不用于课程成绩或能力认证。目前仅限年满 18 岁者参加。</p><div className="exam-form-grid">
        <label>年龄组<select value={profile.ageGroup} onChange={e=>setProfile({...profile,ageGroup:e.target.value})}><option value="">请选择</option><option value="18-24">18–24 岁</option><option value="25-34">25–34 岁</option><option value="35+">35 岁及以上</option></select></label>
        <label>日语水平<select value={profile.japaneseLevel} onChange={e=>setProfile({...profile,japaneseLevel:e.target.value})}><option value="">请选择</option>{['N5','N4','N3','N2','N1'].map(l=><option key={l}>{l}</option>)}<option value="Unknown">未取得等级证书</option></select></label>
        <label>AI 学习经验<select value={profile.aiExperience} onChange={e=>setProfile({...profile,aiExperience:e.target.value})}><option value="">请选择</option><option value="None">从未使用</option><option value="Occasional">偶尔使用</option><option value="Frequent">经常使用</option></select></label>
      </div><label className="check-label"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/>我已阅读说明，自愿参加，且已年满 18 岁。</label><button disabled={busy||!consent||Object.values(profile).some(v=>!v)} onClick={()=>run(async()=>{setView(await api('learner.consent',{profile,consent:true}));})}>同意并进入</button></section>:<>
      {screen==='home'&&<><section className="exam-box"><h1>研究进度</h1><table className="study-table"><thead><tr><th>环节</th><th>状态</th><th>操作</th></tr></thead><tbody>
        <tr><td>1. 前测</td><td>{view.attempts.Pre?.submittedAt?'已提交':view.attempts.Pre?'进行中':'待开始'}</td><td><button disabled={busy||!!view.attempts.Pre?.submittedAt||!view.settings.accepting} onClick={()=>start('Pre')}>{view.attempts.Pre?'继续前测':'开始前测'}</button></td></tr>
        <tr><td>2. 学习环节</td><td>{view.learningCompletedAt?'已完成':`${view.settings.learningMinutes} 分钟 · 六项任务`}</td><td><button disabled={busy||!view.attempts.Pre?.submittedAt||!!view.learningCompletedAt||!view.settings.accepting} onClick={()=>run(async()=>{setView(await api('learner.learningStart'));setScreen('learning');})}>{view.learningStartedAt?'继续学习':'开始学习'}</button></td></tr>
        {(['Post','Delayed'] as Stage[]).map((s,i)=><tr key={s}><td>{i+3}. {labels[s]}</td><td>{view.attempts[s]?.submittedAt?'已提交':s==='Delayed'&&view.delayedAvailableAt?`开放：${new Date(view.delayedAvailableAt).toLocaleString('zh-CN')}`:'待开始'}</td><td><button disabled={busy||!!view.attempts[s]?.submittedAt||!view.settings.accepting||(s==='Post'?!view.learningCompletedAt:!view.delayedAvailableAt||time<Date.parse(view.delayedAvailableAt))} onClick={()=>start(s)}>{view.attempts[s]?'继续答题':'开始答题'}</button></td></tr>)}
        <tr><td>5. 学习体验问卷</td><td>{view.questionnaire?'已提交':'即时后测完成后填写'}</td><td><button disabled={!view.attempts.Post?.submittedAt||!!view.questionnaire} onClick={()=>setScreen('survey')}>填写问卷</button></td></tr>
      </tbody></table><p className="exam-note">提交后不提前公布分数或答案，以免影响后续测试。{!view.settings.accepting&&'研究者已暂停收集，请联系研究者。'}</p></section><section className="exam-box"><h2>考前确认</h2><ul><li>保持安静，关闭其他 AI、翻译和词典工具。</li><li>输入会在本机暂存，并自动同步到服务器。</li><li>点击开始后连续计时，关闭网页不会暂停。</li><li>请用日语文字回答开放题，系统不录音。</li></ul></section></>}
      {screen==='exam'&&active&&<section className="exam-box"><div className="exam-heading"><h1>{labels[stage]}</h1><strong role="timer">剩余 {clock((Date.parse(active.deadline)-time)/1000)}</strong></div><p className="exam-note" aria-live="polite">已完成 {active.questions.filter(q=>answers[q.id]?.trim()).length} / {active.questions.length} · {saved}</p><div className="exam-layout"><aside className="question-list">{active.questions.map((q,i)=><button key={q.id} className={i===index?'selected':''} onClick={()=>setIndex(i)} title={`第 ${i+1} 题`}>{i+1}{answers[q.id]?' ✓':''}</button>)}</aside><div className="question-body">{(()=>{const q=active.questions[index];return <><p>第 {index+1} 题 / {names[q.dimension]}</p><h2 className="question-prompt">{q.prompt}</h2>{q.kind==='choice'?<fieldset className="exam-options"><legend className="sr-only">请选择答案</legend>{q.options!.map(o=><label key={o}><input type="radio" name={q.id} checked={answers[q.id]===o} onChange={()=>change(q.id,o)}/><span>{o}</span></label>)}</fieldset>:<label>日语答案<textarea rows={q.kind==='recall'?3:7} maxLength={3000} value={answers[q.id]??''} onChange={e=>change(q.id,e.target.value)} autoComplete="off" spellCheck={false}/></label>}</>;})()}<div className="exam-actions"><button disabled={index===0} onClick={()=>setIndex(v=>v-1)}><ArrowLeft size={16}/>上一题</button><button disabled={busy} onClick={()=>run(async()=>{await pending.current.catch(()=>{});await save();})}><Save size={16}/>保存</button>{index<active.questions.length-1?<button onClick={()=>setIndex(v=>v+1)}>下一题<ArrowRight size={16}/></button>:<button disabled={busy} onClick={()=>submit()}><Send size={16}/>提交答卷</button>}</div></div></div></section>}
      {screen==='learning'&&<section className="exam-box"><div className="exam-heading"><h1>学习环节</h1><span>已学习 {clock((time-Date.parse(view.learningStartedAt!))/1000)} / {view.settings.learningMinutes} 分钟</span></div><p>每项任务最多请求三次反馈。阅读反馈后请尝试修改答案。完成六项任务并达到规定学习时长后，可以进入后测。</p><div className="exam-tabs">{learningTasks.map((t,i)=><button key={t.id} className={i===task?'selected':''} onClick={()=>{setTask(i);setPractice('');}}>{i+1}{view.feedback.some(f=>f.taskId===t.id)?' ✓':''}</button>)}</div><h2>{learningTasks[task].prompt}</h2><label>你的练习答案<textarea value={practice} onChange={e=>setPractice(e.target.value)} maxLength={2000} rows={5}/></label><button disabled={busy||!practice.trim()||view.feedback.filter(f=>f.taskId===learningTasks[task].id).length>=3} onClick={()=>run(async()=>{setView(await api('learner.feedback',{taskId:learningTasks[task].id,answer:practice}));})}>{busy?'正在请求反馈…':'提交练习，获取反馈'}</button>{view.feedback.filter(f=>f.taskId===learningTasks[task].id).map((f,i)=><div className="feedback-entry" key={i}><strong>第 {i+1} 次练习</strong><p className="whitespace-pre-wrap">{f.input}</p><p className="whitespace-pre-wrap">{f.feedback.startsWith('pending:')?'反馈正在生成，请稍后刷新。':f.feedback}</p></div>)}<div className="exam-actions"><button onClick={()=>setScreen('home')}>返回进度</button><button disabled={busy||time-Date.parse(view.learningStartedAt!)<view.settings.learningMinutes*60000} onClick={()=>run(async()=>{setView(await api('learner.learningFinish'));setScreen('home');})}>完成学习环节</button></div></section>}
      {screen==='survey'&&<section className="exam-box"><h1>学习体验问卷</h1><p>1 = 非常不同意，2 = 不同意，3 = 一般，4 = 同意，5 = 非常同意。</p>{questionnairePrompts.map(item=><fieldset className="survey-row" key={item.key}><legend>{item.label}</legend>{[1,2,3,4,5].map(v=><label key={v}><input type="radio" name={item.key} checked={responses[item.key]===v} onChange={()=>setResponses({...responses,[item.key]:v})}/>{v}</label>)}</fieldset>)}<div className="exam-actions"><button onClick={()=>setScreen('home')}>返回</button><button disabled={busy||Object.keys(responses).length!==6} onClick={()=>run(async()=>{setView(await api('learner.survey',{responses}));setScreen('home');})}>提交问卷</button></div></section>}
      </>}
    </>}
  </main><footer className="exam-footer">版权所有：廖鹏宇。研究用途 · 请勿在答案中填写个人身份信息。</footer></div>;
}
