'use client';
import {useState} from 'react';
import {createBrowserClient} from '@supabase/ssr';
type Event={id:string;title:string};
type Question={id:string;label:string;type:'rating'|'text'|'certificate_text';required:boolean};
type Saved={event_id:string;feedback_open?:boolean;feedback_questions?:Question[]};
const defaults:Question[]=[
{id:'rating',label:'How would you rate this event?',type:'rating',required:true},
{id:'feedback',label:'Please share your feedback',type:'text',required:true}
];
export default function FeedbackEditor({events,templates}:{events:Event[];templates:Saved[]}){
 const [event,setEvent]=useState(events[0]?.id??'');
 const existing=templates.find(t=>t.event_id===event);
 const [open,setOpen]=useState(existing?.feedback_open??true);
 const [questions,setQuestions]=useState<Question[]>(existing?.feedback_questions?.length?existing.feedback_questions:defaults);
 const [busy,setBusy]=useState(false),[message,setMessage]=useState('');
 function changeEvent(id:string){
  setEvent(id);const template=templates.find(t=>t.event_id===id);
  setOpen(template?.feedback_open??true);
  setQuestions((template?.feedback_questions?.length?template.feedback_questions:defaults).map(q=>({...q})));
  setMessage('');
 }
 function edit(i:number,patch:Partial<Question>){setQuestions(old=>old.map((q,j)=>i===j?{...q,...patch}:q));}
 async function save(){
  setBusy(true);setMessage('');
  try{
   const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
   if(!url||!key)throw Error('Supabase unavailable');
   if(!event||!questions.length)throw Error('Add at least one question');
   const seen=new Set<string>();
   for(const q of questions){
    if(!/^[a-z][a-z0-9_]{0,39}$/.test(q.id)||seen.has(q.id)||q.label.trim().length<2)
    throw Error('Use unique lowercase question keys and descriptions');
    seen.add(q.id);
   }
   const client=createBrowserClient(url,key);
   const {error}=await client.rpc('set_certificate_feedback_settings',{p_event:event,p_questions:questions,p_open:open});
   if(error)throw Error('Could not save feedback questions');
   setMessage('Feedback settings saved.');
  }catch(e){setMessage(e instanceof Error?e.message:'Unable to save');}finally{setBusy(false);}
 }
 return <section style={{padding:24,borderRadius:18,border:'1px solid #34365b',marginTop:30}}>
  <h2>Feedback form builder</h2><p className="muted">Require participant feedback before the participation certificate is issued.</p>
  <label>Event<select value={event} onChange={e=>changeEvent(e.target.value)} style={{display:'block',padding:12,margin:'8px 0',width:'100%'}}>{events.map(e=><option key={e.id} value={e.id}>{e.title}</option>)}</select></label>
  <label style={{display:'flex',gap:12,alignItems:'center'}}><input type="checkbox" checked={open} onChange={e=>setOpen(e.target.checked)}/> Feedback form open</label>
  <div style={{display:'grid',gap:14,marginTop:16}}>
   {questions.map((q,i)=><div key={i} style={{padding:14,border:'1px solid #34365b',borderRadius:12,display:'grid',gap:9}}>
    <label>Question key<input value={q.id} onChange={e=>edit(i,{id:e.target.value.toLowerCase()})} style={{display:'block',padding:10,width:'100%'}}/></label>
    <label>Question text<input value={q.label} maxLength={160} onChange={e=>edit(i,{label:e.target.value})} style={{display:'block',padding:10,width:'100%'}}/></label>
    <label>Answer type<select value={q.type} onChange={e=>edit(i,{type:e.target.value as 'text'|'rating'|'certificate_text'})} style={{padding:10,marginLeft:9}}><option value="rating">Rating 1–5</option><option value="text">Private feedback text</option><option value="certificate_text">Public certificate field</option></select></label>
    <label><input type="checkbox" checked={q.required} onChange={e=>edit(i,{required:e.target.checked})}/> Required answer</label>
    <button type="button" onClick={()=>setQuestions(old=>old.filter((_,j)=>i!==j))} disabled={questions.length<=1}>Delete question</button>
   </div>)}
  </div>
  <div style={{display:'flex',gap:12,marginTop:18,flexWrap:'wrap'}}>
   <button disabled={questions.length>=15} onClick={()=>setQuestions(old=>[...old,{id:'question_'+(old.length+1),label:'New question',type:'text',required:true}])}>+ Add question</button>
   <button disabled={busy||!event} onClick={save} style={{background:'#a78bfa',color:'#151b2f',fontWeight:700,padding:12,borderRadius:10}}>{busy?'Saving…':'Save feedback settings'}</button>
  </div>
  <p role="status">{message}</p>
 </section>;
}
