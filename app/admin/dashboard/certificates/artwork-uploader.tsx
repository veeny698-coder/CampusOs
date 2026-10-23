'use client';
import {useState} from 'react';
import {createBrowserClient} from '@supabase/ssr';
type Event={id:string;title:string};
type Template={event_id:string;image_path?:string|null;coordinator_image_path?:string|null};
export default function ArtworkUploader({events,templates}:{events:Event[];templates:Template[]}){
 const [event,setEvent]=useState(events[0]?.id??'');
 const [coordinator,setCoordinator]=useState(false);
 const [file,setFile]=useState<File|null>(null);
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState('');
 const [paths,setPaths]=useState<Record<string,string>>({});
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
 const existing=templates.find(t=>t.event_id===event);
 const savedPath=paths[event+String(coordinator)]||(coordinator?existing?.coordinator_image_path:existing?.image_path)||'';
 const src=url&&savedPath?url+'/storage/v1/object/public/certifrenzy-templates/'+savedPath.split('/').map(encodeURIComponent).join('/'):null;
 async function upload(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();setBusy(true);setMessage('');
  try{
   const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
   if(!url||!key)throw Error('Storage is not configured');
   if(!event||!file)throw Error('Select event and artwork');
   if(file.size>5*1024*1024)throw Error('Maximum file size is 5 MB');
   const formats:Record<string,string>={'image/png':'png','image/jpeg':'jpg','image/webp':'webp'};
   const extension=formats[file.type];if(!extension)throw Error('Use PNG, JPG or WEBP');
   const client=createBrowserClient(url,key);
   const path=event+'/'+crypto.randomUUID()+'.'+extension;
   const {error:uploadError}=await client.storage.from('certifrenzy-templates').upload(path,file,{contentType:file.type,upsert:false});
   if(uploadError)throw Error('Upload failed. Sign in as a platform owner.');
   const {error:saveError}=await client.rpc('save_certificate_artwork',{p_event:event,p_path:path,p_coordinator:coordinator});
   if(saveError)throw Error('Image uploaded, but assigning the template failed. Try again.');
   setPaths(old=>({...old,[event+String(coordinator)]:path}));setFile(null);
   setMessage('Artwork saved for this event.');
  }catch(err){setMessage(err instanceof Error?err.message:'Upload failed');}
  finally{setBusy(false);}
 }
 return <section style={{padding:24,borderRadius:18,border:'1px solid #34365b',marginTop:30}}>
  <h2>Upload certificate artwork</h2><p className="muted">Use your exact PNG/JPG/WEBP design as the certificate background. Name, event, date, certificate ID and verification QR are rendered above it.</p>
  <form onSubmit={upload} style={{display:'grid',gap:14}}>
   <label>Event<select value={event} onChange={e=>setEvent(e.target.value)} style={{display:'block',width:'100%',padding:12,marginTop:7}}>{events.map(e=><option key={e.id} value={e.id}>{e.title}</option>)}</select></label>
   <label>Template type<select value={String(coordinator)} onChange={e=>setCoordinator(e.target.value==='true')} style={{display:'block',padding:12,marginTop:7,width:'100%'}}><option value="false">Participant</option><option value="true">Coordinator</option></select></label>
   <label>Artwork image<input type="file" accept="image/png,image/jpeg,image/webp" required onChange={e=>setFile(e.target.files?.[0]||null)} style={{display:'block',marginTop:9}}/></label>
   <button disabled={busy||!event||!file} style={{padding:12,borderRadius:10,background:'#a78bfa',color:'#151b2f'}}>{busy?'Uploading…':'Upload and assign background'}</button>
   <p role="status">{message}</p>
  </form>
  {src&&<div style={{marginTop:12}}><p>Current background</p><img src={src} alt="Current certificate background" style={{width:'100%',maxWidth:650,borderRadius:10}}/></div>}
 </section>;
}
