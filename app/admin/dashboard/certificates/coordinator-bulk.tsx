'use client';
import {useState} from 'react';
import {createBrowserClient} from '@supabase/ssr';
type Person={name:string;fields:Record<string,string>};
function parseCsv(input:string):string[][]{
 const rows:string[][]=[];let row:string[]=[],value='',quoted=false;
 const content=input.replace(/^\uFEFF/,'');
 for(let i=0;i<content.length;i++){
  const char=content[i];
  if(char==='"'){
   if(quoted&&content[i+1]==='"'){value+='"';i++;}else quoted=!quoted;
  }else if(!quoted&&char===','){row.push(value);value='';}
  else if(!quoted&&(char==='\n'||char==='\r')){
   row.push(value);value='';
   if(row.some(cell=>cell.trim()))rows.push(row);
   row=[];if(char==='\r'&&content[i+1]==='\n')i++;
  }else value+=char;
 }
 if(quoted)throw Error('CSV contains an unclosed quote');
 row.push(value);if(row.some(cell=>cell.trim()))rows.push(row);
 return rows;
}
export default function CoordinatorBulk({events}:{events:{id:string;title:string}[]}){
 const [event,setEvent]=useState(events[0]?.id||'');
 const [rows,setRows]=useState<Person[]>([]);
 const [busy,setBusy]=useState(false),[message,setMessage]=useState('');
 async function read(file:File|null){
  setRows([]);setMessage('');
  if(!file)return;
  try{
   if(file.size>256*1024)throw Error('CSV limit is 256 KB.');
   const parsed=parseCsv(await file.text());
   if(parsed.length<2)throw Error('CSV must have a header and at least one coordinator');
   const headers=parsed[0].map(h=>h.trim().toLowerCase().replace(/[^a-z0-9_]/g,'_'));
   if(headers[0]!=='name')throw Error('First column must be name');
   if(parsed.length-1>300)throw Error('Maximum 300 coordinators per upload');
   const records=parsed.slice(1).map(cells=>{
    const name=(cells[0]||'').trim();
    if(name.length<2||name.length>120)throw Error('Invalid coordinator name');
    const fields:Record<string,string>={};
    for(let j=1;j<headers.length;j++){
     const k=headers[j],v=(cells[j]||'').trim();
     if(k&&/^[a-z][a-z0-9_]{0,39}$/.test(k)&&v)fields[k]=v.slice(0,200);
    }
    if(JSON.stringify(fields).length>2000)throw Error('Too many custom fields');
    return {name,fields};
   });
   setRows(records);setMessage(records.length+' coordinator rows loaded. Review and upload.');
  }catch(e){setMessage(e instanceof Error?e.message:'Could not read CSV');}
 }
 async function upload(){
  setBusy(true);setMessage('');
  try{
   const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
   if(!url||!key)throw Error('Supabase unavailable');
   if(!event||!rows.length)throw Error('Select an event and load CSV');
   const client=createBrowserClient(url,key);
   const {data,error}=await client.rpc('bulk_save_certificate_coordinators',{p_event:event,p_people:rows});
   if(error)throw Error('Upload failed. Check roster and access permissions.');
   setMessage(data+' coordinator records saved. Each can now use the coordinator lookup link.');
  }catch(e){setMessage(e instanceof Error?e.message:'Upload failed');}finally{setBusy(false);}
 }
 return <section style={{marginTop:30,padding:24,border:'1px solid #34365b',borderRadius:18}}>
  <h2>Bulk coordinator roster</h2><p className="muted">CSV first column: name. Additional columns become certificate placeholders, such as role, department and designation.</p>
  <a download="coordinator-roster-template.csv" href={'data:text/csv;charset=utf-8,'+encodeURIComponent('name,role,department,designation\nExample Coordinator,Event Lead,Student Affairs,Lead Coordinator\n')}>Download CSV format ↓</a>
  <label style={{display:'block',marginTop:18}}>Event<select value={event} onChange={e=>setEvent(e.target.value)} style={{display:'block',padding:12,width:'100%',marginTop:7}}>{events.map(e=><option key={e.id} value={e.id}>{e.title}</option>)}</select></label>
  <label style={{display:'block',marginTop:18}}>CSV file<input type="file" accept=".csv,text/csv" onChange={e=>void read(e.target.files?.[0]||null)} style={{display:'block',marginTop:9}}/></label>
  {rows.length>0&&<div style={{marginTop:14}}><strong>{rows.length} coordinators</strong><ul>{rows.slice(0,8).map((r,i)=><li key={i}>{r.name} — {Object.entries(r.fields).map(([k,v])=>k+': '+v).join(', ')}</li>)}</ul>{rows.length>8&&<p>…plus {rows.length-8} more</p>}</div>}
  <button disabled={!event||!rows.length||busy} onClick={upload} style={{marginTop:18,background:'#a78bfa',color:'#151b2f',padding:12,borderRadius:10,fontWeight:700}}>{busy?'Uploading…':'Save coordinator roster'}</button>
  <p role="status">{message}</p>
 </section>;
}
