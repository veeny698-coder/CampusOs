'use client';
import {useEffect,useRef,useState} from 'react';
import QRCode from 'qrcode';

type Placeholder={key:string;x:number;y:number;fontSize:number};
export type CertificateData={
 name:string;event:string;code:string;type:string;issued:string;status:string;
 title?:string;subtitle?:string;footer?:string;primary?:string;background?:string;text?:string;
 imagePath?:string|null;placeholders?:Placeholder[]|null;customFields?:Record<string,string>|null;
 verificationPath?:string;qrX?:number;qrY?:number;
};
const defaultFields:Placeholder[]=[
 {key:'name',x:50,y:49,fontSize:78},{key:'event',x:50,y:64,fontSize:30},
 {key:'date',x:24,y:82,fontSize:21},{key:'certificate_id',x:48,y:94,fontSize:16}
];

export default function DownloadCertificate({info}:{info:CertificateData}){
 const canvas=useRef<HTMLCanvasElement>(null);
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState('');
 const [previewReady,setPreviewReady]=useState(false);
 async function imageFrom(src:string){
  const image=new Image();image.crossOrigin='anonymous';image.src=src;
  await new Promise<void>((resolve,reject)=>{image.onload=()=>resolve();image.onerror=()=>reject(Error('Unable to load certificate background image'));});
  return image;
 }
 async function render(){
  const el=canvas.current;if(!el)throw Error('Certificate canvas not available');
  const ctx=el.getContext('2d');if(!ctx)throw Error('Canvas not supported');
  el.width=1400;el.height=990;
  ctx.fillStyle=info.background||'#151b2f';ctx.fillRect(0,0,1400,990);
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  if(info.imagePath){
   if(!url)throw Error('Artwork service not configured');
   const src=url+'/storage/v1/object/public/certifrenzy-templates/'+info.imagePath.split('/').map(encodeURIComponent).join('/');
   const background=await imageFrom(src);
   ctx.drawImage(background,0,0,1400,990);
  }else{
   ctx.strokeStyle=info.primary||'#a78bfa';ctx.lineWidth=10;ctx.strokeRect(35,35,1330,920);
   ctx.lineWidth=2;ctx.strokeRect(55,55,1290,880);
   ctx.fillStyle=info.primary||'#a78bfa';ctx.font='bold 34px Arial';ctx.textAlign='center';ctx.textBaseline='middle';
   ctx.fillText('CAMPUSOS ✦ CERTIFRENZY',700,135);
   ctx.font='bold 60px Georgia';ctx.fillText(info.title||'Certificate of '+(info.type==='coordinator'?'Coordination':info.type==='appreciation'?'Appreciation':'Participation'),700,265,1210);
   ctx.fillStyle=info.text||'#ffffff';ctx.font='28px Arial';ctx.fillText(info.subtitle||'is proudly presented to',700,360);
   ctx.font='22px Arial';ctx.fillText(info.footer||'Issued by CampusOS',700,886);
  }
  ctx.textBaseline='middle';ctx.textAlign='center';
  ctx.fillStyle=info.text||'#ffffff';
  const values:Record<string,string>={
   name:info.name,event:info.event,date:new Date(info.issued).toLocaleDateString('en-IN'),
   certificate_id:info.code,...(info.customFields||{})
  };
  const fields=info.placeholders?.length?info.placeholders:defaultFields;
  for(const field of fields){
   if(!Object.prototype.hasOwnProperty.call(values,field.key))continue;
   const x=Math.max(0,Math.min(100,Number(field.x)))*14;
   const y=Math.max(0,Math.min(100,Number(field.y)))*9.9;
   const size=Math.max(10,Math.min(130,Number(field.fontSize)));
   ctx.font='bold '+size+'px Georgia,serif';
   ctx.fillText(String(values[field.key]||''),x,y,Math.max(40,Math.min(1200,1400-2*Math.abs(x-700)-35)));
  }
  const qr=await QRCode.toDataURL(window.location.origin+(info.verificationPath||'/verify/certificate/'+info.code),{width:220,margin:1});
  const image=await imageFrom(qr);
  const qx=Math.max(7,Math.min(93,info.qrX??86))*14;
  const qy=Math.max(9,Math.min(91,info.qrY??78))*9.9;
  ctx.fillStyle='#ffffff';ctx.fillRect(qx-100,qy-100,200,200);
  ctx.drawImage(image,qx-93,qy-93,186,186);
  return el;
 }
 useEffect(()=>{let active=true;void render().then(()=>{if(active)setPreviewReady(true);}).catch(err=>{if(active)setMessage(err instanceof Error?err.message:'Preview unavailable');});return ()=>{active=false;};},[]);
 async function png(){
  setBusy(true);setMessage('');
  try{
   const el=await render();
   const blob=await new Promise<Blob|null>(done=>el.toBlob(done,'image/png'));
   if(!blob)throw Error('PNG export failed');
   const url=URL.createObjectURL(blob);
   const anchor=document.createElement('a');anchor.href=url;anchor.download='certificate-'+info.code+'.png';anchor.click();
   window.setTimeout(()=>URL.revokeObjectURL(url),15000);
   setMessage('Certificate PNG downloaded.');
  }catch(error){setMessage(error instanceof Error?error.message:'Download failed');}finally{setBusy(false);}
 }
 async function pdf(){
  setBusy(true);setMessage('');
  try{
   const el=await render();
   const data=el.toDataURL('image/png');
   const win=window.open('','_blank');
   if(!win)throw Error('Allow pop-ups to use Save as PDF');
   const doc=win.document;doc.title='Certificate '+info.code;
   const style=doc.createElement('style');style.textContent='@page{size:landscape;margin:0}html,body{margin:0}img{display:block;max-width:100vw;max-height:100vh;margin:auto}';
   doc.head.appendChild(style);
   const img=doc.createElement('img');img.src=data;img.alt='Certificate';
   doc.body.appendChild(img);
   img.onload=()=>{win.focus();win.print();};
   setMessage('Choose Save as PDF in the print dialog.');
  }catch(error){setMessage(error instanceof Error?error.message:'PDF export failed');}finally{setBusy(false);}
 }
 return <section style={{display:'grid',justifyItems:'center',gap:12,marginTop:26}}>
  <canvas ref={canvas} width={1400} height={990} aria-label="Certificate artwork preview" style={{display:"block",width:"100%",maxWidth:860,aspectRatio:"1400/990",opacity:previewReady?1:0.3,borderRadius:8}}/>
  {info.status==='valid'?<div style={{display:'flex',gap:12,flexWrap:'wrap',justifyContent:'center'}}>
   <button disabled={busy} onClick={png} style={{padding:12,borderRadius:8,background:'#a78bfa',color:'#151b2f'}}>Download PNG</button>
   <button disabled={busy} onClick={pdf} style={{padding:12,borderRadius:8,background:'#a78bfa',color:'#151b2f'}}>Save as PDF</button>
  </div>:<p role="alert">Revoked certificates cannot be downloaded.</p>}
  <p role="status" aria-live="polite">{message}</p>
 </section>;
}
