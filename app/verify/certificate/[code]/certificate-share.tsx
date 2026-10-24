'use client';
import {useState} from 'react';
type Props={name:string;event:string;code:string;kind?:'participation'|'appreciation'|'coordinator';issued:string};
export default function CertificateShare({name,event,code,kind='participation',issued}:Props){
 const [message,setMessage]=useState('');
 const path=kind==='coordinator'?'/verify/coordinator/':'/verify/certificate/';
 const url=typeof window==='undefined'?'https://campusblaze-os.vercel.app'+path+code:window.location.origin+path+code;
 const title=kind==='coordinator'?'Certificate of Coordination':kind==='appreciation'?'Certificate of Appreciation':'Certificate of Participation';
 const summary='Verified '+title+' for '+name+' at '+event+'. Certificate ID: '+code+'.';
 const linkedIn=new URL('https://www.linkedin.com/profile/add');
 linkedIn.searchParams.set('startTask','CERTIFICATION_NAME');
 linkedIn.searchParams.set('name',title+' – '+event);
 linkedIn.searchParams.set('organizationName','CertiFrenzy');
 linkedIn.searchParams.set('certUrl',url);
 linkedIn.searchParams.set('certId',code);
 const issuedDate=new Date(issued);
 if(!Number.isNaN(issuedDate.getTime())){
  linkedIn.searchParams.set('issueYear',String(issuedDate.getFullYear()));
  linkedIn.searchParams.set('issueMonth',String(issuedDate.getMonth()+1));
 }
 async function copy(){
  try{await navigator.clipboard.writeText(url);setMessage('Verification link copied.');}
  catch{setMessage('Could not copy the link.');}
 }
 async function share(){
  try{
   if(navigator.share){await navigator.share({title,text:summary,url});}
   else await copy();
  }catch{setMessage('Sharing was cancelled.');}
 }
 return <div style={{display:'grid',gap:10,justifyItems:'center',marginTop:20}}>
  <p style={{fontSize:13,color:'#b9a5ff'}}>Powered by CertiFrenzy</p>
  <div style={{display:'flex',gap:10,flexWrap:'wrap',justifyContent:'center'}}>
   <button onClick={copy} style={{padding:10,border:'1px solid #a78bfa',borderRadius:8}}>Copy verification link</button>
   <button onClick={share} style={{padding:10,border:'1px solid #a78bfa',borderRadius:8}}>Share certificate</button>
   <a target="_blank" rel="noopener noreferrer" href={'https://wa.me/?text='+encodeURIComponent(summary+' '+url)} style={{padding:10,border:'1px solid #a78bfa',borderRadius:8}}>WhatsApp</a>
   <a target="_blank" rel="noopener noreferrer" href={linkedIn.toString()} style={{padding:10,border:'1px solid #a78bfa',borderRadius:8}}>Add to LinkedIn</a>
  </div>
  <p role="status">{message}</p>
 </div>;
}
