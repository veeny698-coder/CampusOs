'use client';
import {useActionState,useState} from 'react';
import {bulkIssue,saveTemplate} from './template-actions';
type Template={event_id:string;title:string;subtitle:string;footer:string;primary_color:string;background_color:string;text_color:string;name_y:number;qr_x:number;qr_y:number;layout:string};
const defaults={title:'Certificate of Participation',subtitle:'is proudly presented to',footer:'Issued by CampusOS',primary_color:'#a78bfa',background_color:'#151b2f',text_color:'#ffffff',name_y:49,qr_x:86,qr_y:78,layout:'classic'};
export default function TemplateEditor({events,templates}:{events:{id:string;title:string}[];templates:Template[]}){
 const [event,setEvent]=useState(events[0]?.id||'');
 const [draft,setDraft]=useState({...defaults,...templates.find(t=>t.event_id===event)});
 const [saved,saveAction,saving]=useActionState(saveTemplate,{ok:false,message:''});
 const [bulk,bulkAction,issuing]=useActionState(bulkIssue,{ok:false,message:''});
 const modify=(key:keyof typeof defaults,value:string|number)=>setDraft(previous=>({...previous,[key]:value}));
 function selectEvent(id:string){setEvent(id);setDraft({...defaults,...templates.find(t=>t.event_id===id)});}
 return <section style={{marginTop:30,display:'grid',gap:22}}>
  <div style={{padding:24,borderRadius:20,border:'1px solid #34365b',background:'#151b2f'}}>
   <h2>Certificate template studio</h2>
   <p className="muted">Set the design once for each event. Saved templates appear on verified certificates.</p>
   <label htmlFor="template-event">Event</label>
   <select id="template-event" value={event} onChange={e=>selectEvent(e.target.value)} style={{display:'block',padding:12,margin:'12px 0',width:'100%',background:'#0d1424',color:'white'}}>
    {events.map(e=><option key={e.id} value={e.id}>{e.title}</option>)}
   </select>
   <form action={saveAction} style={{display:'grid',gap:12}}>
    <input type="hidden" name="event_id" value={event}/>
    {(['title','subtitle','footer'] as const).map(k=><label key={k} style={{display:'grid',gap:5}}>{k.replace('_',' ')}<input name={k} required maxLength={k==='title'?90:160} value={draft[k]} onChange={e=>modify(k,e.target.value)} style={{padding:12,background:'#0d1424',color:'white',border:'1px solid #53617a',borderRadius:8}}/></label>)}
    <div style={{display:'flex',gap:15,flexWrap:'wrap'}}>
     {(['primary_color','background_color','text_color'] as const).map(k=><label key={k}>{k.replace('_',' ')} <input aria-label={k} name={k} type="color" value={draft[k]} onChange={e=>modify(k,e.target.value)}/></label>)}
    </div>
    <label>Layout <select name="layout" value={draft.layout} onChange={e=>modify('layout',e.target.value)} style={{padding:8,marginLeft:12}}><option value="classic">Classic</option><option value="modern">Modern</option><option value="minimal">Minimal</option></select></label>
    {(['name_y','qr_x','qr_y'] as const).map(k=><label key={k} style={{display:'grid',gap:6}}>{k==='name_y'?'Recipient name vertical position':k==='qr_x'?'QR horizontal position':'QR vertical position'}: {draft[k]}%<input type="range" name={k} min={k==='name_y'?20:5} max={k==='name_y'?75:95} value={draft[k]} onChange={e=>modify(k,Number(e.target.value))}/></label>)}
    <div aria-label="Template preview" style={{height:285,position:'relative',background:draft.background_color,color:draft.text_color,border:`5px double ${draft.primary_color}`,borderRadius:8,textAlign:'center',overflow:'hidden'}}>
     <div style={{position:'absolute',top:'12%',width:'100%',fontSize:20,color:draft.primary_color}}>{draft.title}</div>
     <div style={{position:'absolute',top:'29%',width:'100%',fontSize:12}}>{draft.subtitle}</div>
     <div style={{position:'absolute',top:`${draft.name_y}%`,width:'100%',transform:'translateY(-50%)',fontSize:26,fontFamily:draft.layout==='classic'?'Georgia,serif':'sans-serif'}}>Recipient Name</div>
     <div style={{position:'absolute',top:'64%',width:'100%',fontSize:13}}>Event title</div>
     <div style={{position:'absolute',bottom:12,width:'100%',fontSize:11}}>{draft.footer}</div>
     <div style={{position:'absolute',top:`${draft.qr_y}%`,left:`${draft.qr_x}%`,transform:'translate(-50%,-50%)',background:'#fff',color:'#111',padding:6,fontSize:11}}>QR</div>
    </div>
    <button disabled={!event||saving} style={{padding:12,background:'#a78bfa',color:'#101021',borderRadius:10,fontWeight:700}}>{saving?'Saving…':'Save design'}</button>
    <p role="status">{saved.message}</p>
   </form>
  </div>
  <form action={bulkAction} style={{display:'grid',gap:12,padding:24,border:'1px solid #34365b',borderRadius:20}}>
   <h2>Bulk certificate issuance</h2><p className="muted">Issue certificates to all existing registrations for the selected event (up to 1,000 per event). Duplicates are skipped.</p>
   <input type="hidden" name="event_id" value={event}/>
   <label>Certificate type <select name="certificate_type" style={{padding:10,marginLeft:12}}><option value="participation">Participation</option><option value="appreciation">Appreciation</option></select></label>
   <button type="submit" disabled={!event||issuing} style={{padding:12,background:'#a78bfa',color:'#101021',borderRadius:10,fontWeight:700}}>{issuing?'Issuing…':'Issue certificates to all registered participants'}</button>
   <p role="status">{bulk.message}</p>
   {event&&<a style={{color:'#b9a5ff'}} href={'/admin/dashboard/certificates/export?event='+encodeURIComponent(event)}>Download event certificates (ZIP) ↗</a>}
  </form>
 </section>;
}
