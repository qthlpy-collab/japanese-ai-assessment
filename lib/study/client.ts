export function apiUrl() { return process.env.NEXT_PUBLIC_API_URL || '/api/research'; }
export async function callApi<T>(op:string, data:Record<string,unknown>={}, token=''):Promise<T> {
  if(process.env.NEXT_PUBLIC_STATIC_HOST==='true'&&!process.env.NEXT_PUBLIC_API_URL)throw new Error('此 GitHub Pages 入口尚未连接收卷服务器。请使用研究者提供的正式考试地址。 / Collection server is not connected.');
  const response=await fetch(apiUrl(),{method:'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},body:JSON.stringify({op,...data}),signal:AbortSignal.timeout(60000)});
  let result;try{result=await response.json();}catch{throw new Error('无法连接收卷服务器，请检查网络或联系研究者。 / Collection server unavailable.');}
  if(!response.ok || result.error)throw new Error(result.error || 'Request failed.');
  return result as T;
}
export function downloadFile(name:string, content:string, type='application/json') {
  const url=URL.createObjectURL(new Blob([type.includes('csv')?'\uFEFF':'',content],{type}));
  const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
