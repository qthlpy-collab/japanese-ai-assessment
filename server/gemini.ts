export async function gemini(prompt: string, json=false) {
  const key=process.env.GEMINI_API_KEY;
  if(!key) throw new Error('Online AI is not configured. Set GEMINI_API_KEY on the server.');
  const model=process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  if(!/^[a-zA-Z0-9.-]+$/.test(model)) throw new Error('Invalid Gemini model identifier.');
  const response=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':key}, signal:AbortSignal.timeout(45000),
    body:JSON.stringify({ contents:[{role:'user',parts:[{text:prompt}]}], generationConfig:{temperature:0.2,maxOutputTokens:6000,...(json ? {responseMimeType:'application/json'} : {})} })
  });
  if(!response.ok) throw new Error(`Gemini request failed (${response.status}). Check the server key, quota and model.`);
  const data=await response.json();
  const text=(data.candidates?.[0]?.content?.parts ?? []).map((p:{text?:string})=>p.text ?? '').join('');
  if(!text) throw new Error('The AI returned no usable response. Please retry.');
  return {text,model};
}
