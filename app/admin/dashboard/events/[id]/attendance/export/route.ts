import { NextRequest, NextResponse } from 'next/server';
import { getVerifiedPlatformOwner } from '../../../../../../../lib/auth/platform-owner';

export const dynamic = 'force-dynamic';
const isUuid=(value:string)=>/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
function cell(value:unknown):string {
  // Prevent spreadsheet formula injection even after whitespace and control characters.
  const raw=String(value??'');
  const safe=/^[\s\x00-\x1f]*[=+@-]/.test(raw)?"'"+raw:raw;
  return '"'+safe.replace(/"/g,'""')+'"';
}
export async function GET(_request:NextRequest,{params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  if(!isUuid(id))return new NextResponse('Invalid event',{status:400});
  const access=await getVerifiedPlatformOwner();
  if(!access)return new NextResponse('Unauthorized',{status:401});
  const {data:event,error:eventError}=await access.client.from('events').select('id,title').eq('id',id).maybeSingle();
  if(eventError)return new NextResponse('Service unavailable',{status:503});
  if(!event)return new NextResponse('Event not found',{status:404});
  const rows:string[]=['Name,Email,Registered At,Checked In At,Status'];
  // Bounded pages avoid exporting partial data without warning.
  for(let offset=0;offset<10000;offset+=500){
    const {data,error}=await access.client.from('event_registrations')
      .select('full_name,email,created_at,checked_in_at')
      .eq('event_id',id).order('created_at',{ascending:true}).range(offset,offset+499);
    if(error)return new NextResponse('Export unavailable',{status:503});
    for(const r of data??[])rows.push([r.full_name,r.email,r.created_at,r.checked_in_at??'',r.checked_in_at?'Checked in':'Pending'].map(cell).join(','));
    if((data??[]).length<500)break;
    if(offset===9500)return new NextResponse('Export exceeds 10,000 rows; contact administrator.',{status:413});
  }
  const csv='\uFEFF'+rows.join('\r\n')+'\r\n';
  return new NextResponse(csv,{headers:{
    'Content-Type':'text/csv; charset=utf-8',
    'Content-Disposition':'attachment; filename="campusos-attendance-'+id+'.csv"',
    'Cache-Control':'private, no-store',
    'X-Content-Type-Options':'nosniff',
  }});
}
