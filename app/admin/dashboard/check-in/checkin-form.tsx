'use client';
import { useActionState, useEffect, useRef, useState } from 'react';
import { checkin } from './actions';
import type { Html5Qrcode } from 'html5-qrcode';

const uuidPattern=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function extractToken(value:string):string|null{
 const input=value.trim();
 if(uuidPattern.test(input))return input;
 try{
  const url=new URL(input);
  if(url.protocol!=='https:'&&url.protocol!=='http:')return null;
  // Only accept QR links issued by this CampusOS deployment.
  if(url.origin!==window.location.origin)return null;
  const match=url.pathname.match(/^\/ticket\/([0-9a-f-]{36})\/?$/i);
  return match&&uuidPattern.test(match[1])?match[1]:null;
 }catch{return null;}
}
export default function CheckinForm({initialToken}:{initialToken:string}){
 const [state,action,pending]=useActionState(checkin,{ok:false,message:''});
 const [token,setToken]=useState(initialToken);
 const [scanning,setScanning]=useState(false);
 const [cameraError,setCameraError]=useState('');
 const scanner=useRef<Html5Qrcode|null>(null);
 const starting=useRef(false);
 const stopping=useRef(false);
 const alive=useRef(true);
 const found=useRef(false);
 useEffect(()=>{alive.current=true;return()=>{alive.current=false;const instance=scanner.current;scanner.current=null;if(instance){void instance.stop().catch(()=>{}).then(()=>Promise.resolve(instance.clear()).catch(()=>{}));}};},[]);
 async function stopCamera(){
  if(stopping.current)return;
  stopping.current=true;
  const instance=scanner.current;scanner.current=null;
  if(instance){try{await instance.stop();}catch{}try{instance.clear();}catch{}}
  if(alive.current)setScanning(false);
  stopping.current=false;
 }
 async function startCamera(){
  if(starting.current||scanner.current)return;
  starting.current=true;found.current=false;setCameraError('');
  try{
   if(!navigator.mediaDevices?.getUserMedia)throw new Error('Camera access requires HTTPS and a supported browser.');
   const {Html5Qrcode}=await import('html5-qrcode');
   if(!alive.current)return;
   const instance=new Html5Qrcode('campusos-qr-reader',{verbose:false});
   scanner.current=instance;
   await instance.start({facingMode:'environment'},{fps:8,qrbox:{width:220,height:220}},(value)=>{
    if(found.current)return;
    const parsed=extractToken(value);
    if(!parsed){setCameraError('This is not a CampusOS event ticket. Try another QR code.');return;}
    found.current=true;setToken(parsed);setCameraError('');
    void stopCamera();
   },()=>{});
   if(alive.current)setScanning(true);
   else await stopCamera();
  }catch(error){
   const instance=scanner.current;scanner.current=null;
   if(instance){try{await instance.stop();}catch{}try{instance.clear();}catch{}}
   if(alive.current){setScanning(false);setCameraError(error instanceof Error?error.message:'Camera could not be started. Use manual entry.');}
  }finally{starting.current=false;}
 }
 return <div style={{display:'grid',gap:20,maxWidth:580}}>
  <section style={{padding:20,border:'1px solid #34365b',borderRadius:16,background:'#151b2f'}}>
   <h2 style={{marginTop:0}}>Scan participant QR</h2>
   <p style={{color:'#aab6d0'}}>Use the rear camera to read a CampusOS ticket. Review the token before confirming check-in.</p>
   <div id="campusos-qr-reader" style={{width:'100%',overflow:'hidden',borderRadius:12}}/>
   <button type="button" onClick={()=>void(scanning?stopCamera():startCamera())} disabled={starting.current||stopping.current} style={{padding:'12px 18px',borderRadius:10,background:scanning?'#28314a':'#a78bfa',color:scanning?'white':'#101021',fontWeight:700,marginTop:12}}>{scanning?'Stop camera':'Open camera scanner'}</button>
   {cameraError&&<p role="alert" style={{color:'#fca5a5'}}>{cameraError}</p>}
   <small style={{display:'block',color:'#aab6d0',marginTop:12}}>Camera permission is requested only when you start scanning. Manual entry is always available.</small>
  </section>
  <form action={action} style={{display:'grid',gap:14}}>
   <label htmlFor="token" style={{fontWeight:700}}>Ticket token</label>
   <input id="token" name="token" value={token} onChange={e=>setToken(e.target.value)} required placeholder="Scan or paste ticket UUID" style={{padding:14,border:'1px solid #53617a',borderRadius:10,background:'#151b2f',color:'white',width:'100%'}}/>
   <button disabled={pending||!uuidPattern.test(token.trim())} style={{padding:14,background:'#a78bfa',color:'#101021',borderRadius:10,fontWeight:700}}>{pending?'Checking…':'Confirm participant check-in'}</button>
   <p role="status" aria-live="polite" style={{color:state.ok?'#86efac':'#fca5a5'}}>{state.message}</p>
  </form>
 </div>;
}
