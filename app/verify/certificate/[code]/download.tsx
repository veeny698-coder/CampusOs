'use client';
import {useEffect,useRef,useState} from 'react';
import QRCode from 'qrcode';

type Placeholder={key:string;x:number;y:number;fontSize:number;color?:string;family?:string;align?:string};
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
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  let background:HTMLImageElement|null=null;
  if(info.imagePath){
   if(!url)throw Error('Artwork service not configured');
   const src=url+'/storage/v1/object/public/certifrenzy-templates/'+info.imagePath.split('/').map(encodeURIComponent).join('/');
   background=await imageFrom(src);
   if(background.naturalWidth<300||background.naturalHeight<300||
      background.naturalWidth*background.naturalHeight>20000000)
    throw Error('Artwork must be at least 300 px per side and at most 20 megapixels');
  }
  el.width=background?.naturalWidth||1400;el.height=background?.naturalHeight||990;
  const width=el.width,height=el.height;
  const ctx=el.getContext('2d');if(!ctx)throw Error('Canvas not supported');
  ctx.fillStyle=info.background||'#151b2f';ctx.fillRect(0,0,width,height);
  if(background){
   ctx.drawImage(background,0,0,width,height);
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
   const x=Math.max(0,Math.min(100,Number(field.x)))*width/100;
   const y=Math.max(0,Math.min(100,Number(field.y)))*height/100;
   const size=Math.max(10,Math.min(130,Number(field.fontSize)));
   ctx.fillStyle=field.color&&/^#[0-9a-f]{6}$/i.test(field.color)?field.color:(info.text||'#ffffff');
   ctx.textAlign=field.align==='left'?'left':field.align==='right'?'right':'center';
   const font=field.family==='sans'?'Arial,sans-serif':field.family==='mono'?'monospace':'Georgia,serif';
   ctx.font='bold '+size+'px '+font;
   ctx.fillText(String(values[field.key]||''),x,y,Math.max(40,Math.min(width*0.85,width-2*Math.abs(x-width/2)-20)));
  }
  const qr=await QRCode.toDataURL(window.location.origin+(info.verificationPath||'/verify/certificate/'+info.code),{width:220,margin:1});
  const image=await imageFrom(qr);
  const qrSize=Math.max(80,Math.min(200,Math.min(width,height)*0.20));
  const qx=Math.max(qrSize/2+8,Math.min(width-qrSize/2-8,Math.max(0,Math.min(100,info.qrX??86))*width/100));
  const qy=Math.max(qrSize/2+8,Math.min(height-qrSize/2-8,Math.max(0,Math.min(100,info.qrY??78))*height/100));
  ctx.fillStyle='#ffffff';ctx.fillRect(qx-qrSize/2,qy-qrSize/2,qrSize,qrSize);
  ctx.drawImage(image,qx-qrSize/2+7,qy-qrSize/2+7,qrSize-14,qrSize-14);
  // Mandatory attribution is drawn on the exported canvas even with custom artwork.
  const brandSize=Math.max(14,Math.round(Math.min(width,height)*0.020));
  ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.font='600 '+brandSize+'px Arial,sans-serif';
  const label='Powered by CertiFrenzi';
  const brandWidth=Math.min(width-24,ctx.measureText(label).width+30);
  const brandY=Math.max(brandSize+12,height-28);
  ctx.fillStyle='rgba(12,18,34,0.82)';
  ctx.fillRect((width-brandWidth)/2,brandY-brandSize-7,brandWidth,brandSize+14);
  ctx.fillStyle='#ffffff';
  ctx.fillText(label,width/2,brandY,Math.max(40,brandWidth-14));
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
   const style=doc.createElement('style');style.textContent='@page{size:'+(el.width>=el.height?'landscape':'portrait')+';margin:0}html,body{margin:0}img{display:block;max-width:100vw;max-height:100vh;margin:auto}';
   doc.head.appendChild(style);
   const img=doc.createElement('img');img.src=data;img.alt='Certificate';
   doc.body.appendChild(img);
   img.onload=()=>{win.focus();win.print();};
   setMessage('Choose Save as PDF in the print dialog.');
  }catch(error){setMessage(error instanceof Error?error.message:'PDF export failed');}finally{setBusy(false);}
 }
 return <section style={{display:'grid',justifyItems:'center',gap:12,marginTop:26}}>
  <canvas ref={canvas} width={1400} height={990} aria-label="Certificate artwork preview" style={{display:"block",width:"100%",maxWidth:860,opacity:previewReady?1:0.3,borderRadius:8}}/>
  {info.status==='valid'?<div style={{display:'flex',gap:12,flexWrap:'wrap',justifyContent:'center'}}>
   <button disabled={busy} onClick={png} style={{padding:12,borderRadius:8,background:'#a78bfa',color:'#151b2f'}}>Download PNG</button>
   <button disabled={busy} onClick={pdf} style={{padding:12,borderRadius:8,background:'#a78bfa',color:'#151b2f'}}>Save as PDF</button>
  </div>:<p role="alert">Revoked certificates cannot be downloaded.</p>}
  <p role="status" aria-live="polite">{message}</p>
 </section>;
}
