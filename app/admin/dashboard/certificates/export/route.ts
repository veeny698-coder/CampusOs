import {NextResponse} from 'next/server';
import JSZip from 'jszip';
import sharp from 'sharp';
import QRCode from 'qrcode';
import {getVerifiedPlatformOwner} from '../../../../../lib/auth/platform-owner';

export const dynamic='force-dynamic';
export const runtime='nodejs';

const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PAGE_SIZE=50;
type Field={key:string;x:number;y:number;fontSize:number};

function escapeXml(text:string){
 return text.replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]||c));
}
function safeColor(value:unknown,fallback:string){
 return typeof value==='string'&&/^#[0-9a-fA-F]{6}$/.test(value)?value:fallback;
}
function fieldsFrom(value:unknown):Field[]{
 if(!Array.isArray(value)||!value.length)return [
  {key:'name',x:50,y:49,fontSize:78},{key:'event',x:50,y:64,fontSize:30},
  {key:'date',x:24,y:82,fontSize:21},{key:'certificate_id',x:48,y:94,fontSize:16}
 ];
 return value.filter(f=>f&&typeof f.key==='string').slice(0,24).map(f=>({
  key:f.key,x:Math.max(0,Math.min(100,Number(f.x)||0)),
  y:Math.max(0,Math.min(100,Number(f.y)||0)),
  fontSize:Math.max(10,Math.min(130,Number(f.fontSize)||20))
 }));
}
export async function GET(request:Request){
 const access=await getVerifiedPlatformOwner().catch(()=>null);
 if(!access)return NextResponse.json({error:'Not authorized'},{status:401});
 const params=new URL(request.url).searchParams;
 const eventId=params.get('event')||'';
 const rawPage=Number(params.get('page')||'0');
 if(!UUID.test(eventId)||!Number.isInteger(rawPage)||rawPage<0||rawPage>100)
 return NextResponse.json({error:'Invalid export parameters'},{status:400});
 const eventResult=await access.client.from('events').select('title').eq('id',eventId).maybeSingle();
 if(eventResult.error||!eventResult.data)return NextResponse.json({error:'Event not found'},{status:404});
 const first=rawPage*PAGE_SIZE;
 const {data:certificates,error:certError}=await access.client.from('event_certificates')
 .select('certificate_code,recipient_name,certificate_type,issued_at,custom_fields')
 .eq('event_id',eventId).is('revoked_at',null).order('issued_at',{ascending:true})
 .range(first,first+PAGE_SIZE-1);
 if(certError)return NextResponse.json({error:'Cannot load certificates'},{status:500});
 if(!certificates?.length)return NextResponse.json({error:'No certificates in this export page'},{status:404});
 const {data:template}=await access.client.from('certificate_templates').select('*').eq('event_id',eventId).maybeSingle();
 const base=process.env.NEXT_PUBLIC_SUPABASE_URL;
 const imagePath=template?.image_path;
 let backgroundImage='';
 if(base&&imagePath&&/^[-a-f0-9]{36}\/[-a-f0-9]{36}\.(png|jpg|webp)$/i.test(imagePath)){
  const source=base+'/storage/v1/object/public/certifrenzy-templates/'+imagePath.split('/').map(encodeURIComponent).join('/');
  const response=await fetch(source,{signal:AbortSignal.timeout(8000)});
  if(response.ok&&Number(response.headers.get('content-length')||0)<5242881){
   const buffer=Buffer.from(await response.arrayBuffer());
   if(buffer.length<=5242880){
    const type=imagePath.endsWith('.png')?'image/png':imagePath.endsWith('.webp')?'image/webp':'image/jpeg';
    backgroundImage='data:'+type+';base64,'+buffer.toString('base64');
   }
  }
 }
 const zip=new JSZip();
 const date=new Date().toISOString();
 const site='https://campusblaze-os.vercel.app';
 const primary=safeColor(template?.primary_color,'#a78bfa');
 const foreground=safeColor(template?.text_color,'#ffffff');
 const back=safeColor(template?.background_color,'#151b2f');
 const fields=fieldsFrom(template?.participant_placeholders);
 for(const certificate of certificates){
  const code=String(certificate.certificate_code);
  const qr=await QRCode.toDataURL(site+'/verify/certificate/'+code,{width:180,margin:1});
  const values:Record<string,string>={
   name:certificate.recipient_name,event:eventResult.data.title,
   date:new Date(certificate.issued_at).toLocaleDateString('en-IN'),certificate_id:code,...Object.fromEntries(Object.entries((certificate.custom_fields||{}) as Record<string,unknown>).filter(([,v])=>typeof v==='string'))
  };
  const texts=fields.map(field=>{
   if(!Object.prototype.hasOwnProperty.call(values,field.key))return '';
   const x=field.x*14,y=field.y*9.9;
   return '<text x="'+x+'" y="'+y+'" font-size="'+field.fontSize+'" fill="'+foreground+'" text-anchor="middle" font-family="Georgia,serif" font-weight="bold">'+escapeXml(values[field.key])+'</text>';
  }).join('');
  const heading=backgroundImage?'':[
    '<rect x="40" y="40" width="1320" height="910" fill="none" stroke="'+primary+'" stroke-width="9"/>',
    '<text x="700" y="140" text-anchor="middle" font-size="34" fill="'+primary+'">CAMPUSOS CERTIFRENZY</text>',
    '<text x="700" y="270" text-anchor="middle" font-size="60" fill="'+foreground+'">'+escapeXml(template?.title||'Certificate of Participation')+'</text>',
    '<text x="700" y="362" text-anchor="middle" font-size="27" fill="'+foreground+'">'+escapeXml(template?.subtitle||'is proudly presented to')+'</text>',
    '<text x="700" y="890" text-anchor="middle" font-size="24" fill="'+foreground+'">'+escapeXml(template?.footer||'Issued by CampusOS')+'</text>'
   ].join('');
  const qx=Math.max(7,Math.min(93,Number(template?.qr_x)||86))*14;
  const qy=Math.max(9,Math.min(91,Number(template?.qr_y)||78))*9.9;
  const svg='<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="990" viewBox="0 0 1400 990">'+
   '<rect width="1400" height="990" fill="'+back+'"/>'+
   (backgroundImage?'<image x="0" y="0" width="1400" height="990" preserveAspectRatio="none" href="'+backgroundImage+'"/>':'')+
   heading+texts+
   '<rect x="'+(qx-100)+'" y="'+(qy-100)+'" width="200" height="200" fill="#ffffff"/>'+
   '<image x="'+(qx-93)+'" y="'+(qy-93)+'" width="186" height="186" href="'+qr+'"/></svg>';
  const png=await sharp(Buffer.from(svg)).png().toBuffer();
  zip.file('certificate-'+code+'.png',png);
 }
 zip.file('README.txt','CampusOS CertiFrenzi verified certificate export\nEvent: '+eventResult.data.title+
 '\nExport created: '+date+'\nEach PNG contains a verification QR code.\n');
 const output=await zip.generateAsync({type:'nodebuffer',compression:'DEFLATE',compressionOptions:{level:3}});
 return new Response(new Uint8Array(output),{status:200,headers:{
  'Content-Type':'application/zip',
  'Content-Disposition':'attachment; filename="campusos-certificates-'+eventId+'-'+rawPage+'.zip"',
  'Cache-Control':'no-store',
  'X-Content-Type-Options':'nosniff'
 }});
}
