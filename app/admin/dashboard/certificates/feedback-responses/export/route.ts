import {NextResponse} from 'next/server';
import {getVerifiedPlatformOwner} from '../../../../../../lib/auth/platform-owner';
export const runtime='nodejs';
export const dynamic='force-dynamic';

function csvCell(value:unknown){
 const text=String(value??'');
 const guarded=/^[=+@\-\t\r]/.test(text)?"'"+text:text;
 return '"'+guarded.replace(/"/g,'""')+'"';
}
export async function GET(){
 const access=await getVerifiedPlatformOwner().catch(()=>null);
 if(!access)return NextResponse.json({error:'Unauthorized'},{status:401});
 const {data,error}=await access.client.from('certificate_feedback')
 .select('answers,submitted_at,registration:event_registrations(full_name,email),event:events(title)')
 .order('submitted_at',{ascending:false}).limit(5000);
 if(error)return NextResponse.json({error:'Unable to export feedback'},{status:500});
 const header='Event,Participant,Email,Submitted At,Answers JSON';
 const rows=(data??[]).map(r=>{
  const p=Array.isArray(r.registration)?r.registration[0]:r.registration;
  const e=Array.isArray(r.event)?r.event[0]:r.event;
  return [e?.title??'',p?.full_name??'',p?.email??'',r.submitted_at,JSON.stringify(r.answers)].map(csvCell).join(',');
 });
 return new Response('\uFEFF'+[header,...rows].join('\r\n'),{status:200,headers:{
  'Content-Type':'text/csv; charset=utf-8',
  'Content-Disposition':'attachment; filename="campusos-feedback-responses.csv"',
  'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'
 }});
}
