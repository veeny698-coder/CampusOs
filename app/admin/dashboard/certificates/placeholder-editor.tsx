'use client';
import {useState} from 'react';
import {createBrowserClient} from '@supabase/ssr';
type Event={id:string;title:string};
type Field={key:string;x:number;y:number;fontSize:number};
type Template={event_id:string;participant_placeholders?:Field[]|null;coordinator_placeholders?:Field[]|null;image_path?:string|null;coordinator_image_path?:string|null};
const initial:Field[]=[{key:'name',x:50,y:49,fontSize:78},{key:'event',x:50,y:64,fontSize:30},{key:'date',x:24,y:82,fontSize:21},{key:'certificate_id',x:48,y:94,fontSize:16}];
export default function PlaceholderEditor({events,templates}:{events:Event[];templates:Template[]}){
 const [event,setEvent]=useState(events[0]?.id??'');
 const [coordinator,setCoordinator]=useState(false);
 const selected=templates.find(t=>t.event_id===event);
 const [fields,setFields]=useState<Field[]>(selected?.participant_placeholders?.length?selected.participant_placeholders:initial);
 const [busy,setBusy]=useState(false),[message,setMessage]=useState('');
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
 const imgPath=coordinator?selected?.coordinator_image_path:selected?.image_path;
 const imgSrc=url&&imgPath?url+'/storage/v1/object/public/certifrenzy-templates/'+imgPath.split('/').map(encodeURIComponent).join('/'):null;
 function changeEvent(id:string,coord:boolean){
  setEvent(id);setCoordinator(coord);
  const template=templates.find(t=>t.event_id===id);
  const saved=coord?template?.coordinator_placeholders:template?.participant_placeholders;
  setFields(saved?.length?saved.map(f=>({...f})):initial.map(f=>({...f})));setMessage('');
 }
 function edit(index:number,key:'key'|'x'|'y'|'fontSize',value:string){
  setFields(old=>old.map((f,i)=>i===index?{...f,[key]:key==='key'?value:Number(value)}:f));
 }
 async function save(){
  setBusy(true);setMessage('');
  try{
   const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
   if(!url||!key)throw Error('Supabase is not configured');
   const names=new Set<string>();
   for(const field of fields){
    if(!/^[a-z][a-z0-9_]{0,39}$/.test(field.key)||names.has(field.key))throw Error('Use unique, lowercase placeholder keys');
    names.add(field.key);
   }
   const client=createBrowserClient(url,key);
   const {error}=await client.rpc('save_certificate_placeholders',{p_event:event,p_layout:fields,p_coordinator:coordinator});
   if(error)throw Error('Unable to save placeholder coordinates');
   setMessage('Placeholder positions saved.');
  }catch(e){setMessage(e instanceof Error?e.message:'Save failed');}finally{setBusy(false);}
 }
 return <section style={{border:'1px solid #34365b',padding:24,borderRadius:18,marginTop:30}}>
  <h2>Dynamic text placeholder editor</h2>
  <p className="muted">Configure exact X/Y percentage and font size. Custom fields are accepted as lowercase keys, matching coordinator fields. Positions apply to downloaded certificates.</p>
  <label>Event<select value={event} onChange={e=>changeEvent(e.target.value,coordinator)} style={{display:'block',padding:12,width:'100%',marginTop:8}}>{events.map(e=><option key={e.id} value={e.id}>{e.title}</option>)}</select></label>
  <label>Certificate template<select value={String(coordinator)} onChange={e=>changeEvent(event,e.target.value==='true')} style={{display:'block',padding:12,width:'100%',marginTop:8}}><option value="false">Participant</option><option value="true">Coordinator</option></select></label>
  <div style={{margin:'20px 0',display:'grid',gap:14}}>
   {fields.map((f,i)=><div key={i} style={{padding:13,border:'1px solid #34365b',borderRadius:10,display:'grid',gap:9}}>
    <label>Field key<input value={f.key} onChange={e=>edit(i,'key',e.target.value.toLowerCase())} style={{marginLeft:10,padding:6}}/></label>
    {(['x','y','fontSize'] as const).map(k=><label key={k}>{k==='fontSize'?'Font size':k.toUpperCase()+' position'}: {f[k]}{k==='fontSize'?'px':'%'}
      <input type="range" min={k==='fontSize'?10:0} max={k==='fontSize'?130:100} value={f[k]} onChange={e=>edit(i,k,e.target.value)} style={{display:'block',width:'100%'}}/>
    </label>)}
    <button type="button" onClick={()=>setFields(old=>old.filter((_,j)=>j!==i))} disabled={fields.length===1}>Remove field</button>
   </div>)}
  </div>
  <button type="button" disabled={fields.length>=24} onClick={()=>setFields(old=>[...old,{key:'custom_'+(old.length+1),x:50,y:50,fontSize:24}])}>+ Add placeholder</button>
  <div style={{position:'relative',margin:'18px 0',aspectRatio:'1400/990',background:'#151b2f',border:'3px solid #a78bfa',overflow:'hidden'}}>
   {imgSrc&&<img src={imgSrc} alt="Certificate layout preview" style={{position:'absolute',width:'100%',height:'100%',objectFit:'fill'}}/>}
   {fields.map((f,i)=><span key={i} style={{position:'absolute',left:f.x+'%',top:f.y+'%',transform:'translate(-50%,-50%)',color:'#a78bfa',fontWeight:700,fontSize:'clamp(8px,'+(f.fontSize/1400*100)+'vw,45px)',textShadow:'0 1px 4px #111'}}>{f.key}</span>)}
  </div>
  <button disabled={busy||!event} onClick={save} style={{padding:12,background:'#a78bfa',color:'#151b2f',fontWeight:700,borderRadius:10}}>{busy?'Saving…':'Save placeholder positions'}</button>
  <p role="status">{message}</p>
 </section>;
}
