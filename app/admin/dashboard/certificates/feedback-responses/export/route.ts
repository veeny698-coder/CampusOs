import {NextResponse} from 'next/server';
import {getVerifiedPlatformOwner} from '../../../../../../lib/auth/platform-owner';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const safe=(s:unknown)=>{
 const value=String(s??'');
 const clean=/^[=+@\-\t\r]/.test(value)?"'"+value:value;
 return '"'+clean.replace(/"/g,'""')+'"';
};
export async function GET(){
 const access=await getVerifiedPlatformOwner().catch(()=>null);
 if(!access)return NextResponse.json({error:'Unauthorized'},{status:401});
 const {data:responses,error}=await access.client.from('certificate_feedback').select('registration_id,event_id,answers,submitted_at').order('submitted_at',{ascending:false}).limit(5000);
 if(error)return NextResponse.json({error:'Unable to export responses'},{status:500});
 const ids=[...new Set((responses??[]).map(r=>r.registration_id))];
 const events=[...new Set((responses??[]).map(r=>r.event_id))];
 const [{data:people,error:pError},{data:eventsData,error:eError}]=await Promise.all([
  ids.length?access.client.from('event_registrations').select('id,full_name,email').in('id',ids):Promise.resolve({data:[],error:null}),
  events.length?access.client.from('events').select('id,title').in('id',events):Promise.resolve({data:[],error:null})
 ]);
 if(pError||eError)return NextResponse.json({error:'Unable to join feedback records'},{status:500});
 const persons=new Map((people??[]).map(p=>[p.id,p]));
 const titles=new Map((eventsData??[]).map(e=>[e.id,e.title]));
 const rows=['Event,Participant,Email,Submitted At,Answers JSON',
  ...(responses??[]).map(r=>[
   titles.get(r.event_id)??'',persons.get(r.registration_id)?.full_name??'',
   persons.get(r.registration_id)?.email??'',r.submitted_at,JSON.stringify(r.answers)
  ].map(safe).join(','))];
 return new Response('\uFEFF'+rows.join('\r\n'),{headers:{
  'Content-Type':'text/csv; charset=utf-8',
  'Content-Disposition':'attachment; filename="campusos-feedback-responses.csv"',
  'Cache-Control':'no-store',
  'X-Content-Type-Options':'nosniff'
 }});
}
