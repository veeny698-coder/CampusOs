'use client';
import {useRef,useState} from 'react';
import QRCode from 'qrcode';
export type CertificateData={name:string;event:string;code:string;type:string;issued:string;status:string;
 title?:string;subtitle?:string;footer?:string;primary?:string;background?:string;text?:string};
export default function DownloadCertificate({info}:{info:CertificateData}){
 const canvas=useRef<HTMLCanvasElement>(null);
 const [busy,setBusy]=useState(false),[message,setMessage]=useState('');
 async function render(){
  const el=canvas.current;if(!el)throw Error('Certificate canvas not ready');
  const ctx=el.getContext('2d');if(!ctx)throw Error('Canvas not supported');
  el.width=1400;el.height=990;
  ctx.fillStyle=info.background||'#151b2f';ctx.fillRect(0,0,1400,990);
  ctx.strokeStyle=info.primary||'#a78bfa';ctx.lineWidth=10;ctx.strokeRect(35,35,1330,920);
  ctx.lineWidth=2;ctx.strokeRect(55,55,1290,880);
  ctx.textBaseline='middle';ctx.textAlign='center';
  ctx.fillStyle=info.primary||'#a78bfa';ctx.font='bold 34px Arial';ctx.fillText('CAMPUSOS ✦ CERTIFRENZY',700,135);
  ctx.font='bold 60px Georgia';ctx.fillText(info.title||('Certificate of '+(info.type==='appreciation'?'Appreciation':'Participation')),700,265,1210);
  ctx.fillStyle=info.text||'#ffffff';ctx.font='28px Arial';ctx.fillText(info.subtitle||'is proudly presented to',700,360);
  ctx.fillStyle=info.primary||'#a78bfa';ctx.font='bold 78px Georgia';ctx.fillText(info.name,700,490,1150);
  ctx.fillStyle=info.text||'#ffffff';ctx.font='30px Arial';ctx.fillText(info.event,700,625,1100);
  ctx.font='22px Arial';ctx.fillText(new Date(info.issued).toLocaleDateString('en-IN'),330,805);
  ctx.fillText(info.footer||'Issued by CampusOS',700,886);
  ctx.font='16px Arial';ctx.fillText('Certificate ID: '+info.code,650,945,900);
  const src=await QRCode.toDataURL(window.location.origin+'/verify/certificate/'+info.code,{width:220,margin:1});
  const img=new Image();img.src=src;
  await new Promise<void>((resolve,reject)=>{img.onload=()=>resolve();img.onerror=()=>reject(new Error('QR image failed'));});
  ctx.drawImage(img,1110,720,185,185);
  return el;
 }
 async function download(){
  setBusy(true);setMessage('');
  try{const el=await render();const blob=await new Promise<Blob|null>(r=>el.toBlob(r,'image/png'));if(!blob)throw Error('PNG could not be created');
   const url=URL.createObjectURL(blob);const anchor=document.createElement('a');anchor.href=url;anchor.download='campusos-'+info.code+'.png';anchor.click();
   window.setTimeout(()=>URL.revokeObjectURL(url),10000);
   setMessage('PNG downloaded successfully.');
  }catch(e){setMessage(e instanceof Error?e.message:'Download failed');}finally{setBusy(false);}
 }
 async function pdf(){
  setBusy(true);setMessage('');
  try{const el=await render();const image=el.toDataURL('image/png');
   const popup=window.open('','_blank');
   if(!popup){setMessage('Please allow pop-ups to use Save as PDF.');return;}
   const doc=popup.document;doc.title='CampusOS certificate';const css=doc.createElement('style');css.textContent='@page{size:landscape;margin:0}body{margin:0}img{display:block;max-height:100vh;max-width:100vw;margin:auto}';doc.head.appendChild(css);
   const img=doc.createElement('img');img.src=image;img.alt='Certificate';doc.body.appendChild(img);
   img.onload=()=>{popup.focus();popup.print();};setMessage('In the print dialog, choose Save as PDF.');
  }catch(e){setMessage(e instanceof Error?e.message:'PDF failed');}finally{setBusy(false);}
 }
 return <section style={{marginTop:24,textAlign:'center'}}>
  <canvas ref={canvas} width={1400} height={990} aria-label="Certificate artwork" style={{display:'none'}}/>
  {info.status==='valid'?<div style={{display:'flex',gap:12,flexWrap:'wrap',justifyContent:'center'}}>
   <button onClick={download} disabled={busy} style={{padding:12,borderRadius:8,background:'#a78bfa',color:'#151b2f'}}>Download PNG</button>
   <button onClick={pdf} disabled={busy} style={{padding:12,borderRadius:8,background:'#a78bfa',color:'#151b2f'}}>Save as PDF</button>
  </div>:<p role="alert">Revoked certificate cannot be downloaded.</p>}
  <p role="status">{message}</p>
 </section>;
}
