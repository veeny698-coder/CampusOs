import {getVerifiedPlatformOwner} from '../../../../lib/auth/platform-owner';
import {CommercialForm} from '../command-form';
import {Records,CommercialUnavailable} from '../records';
export const dynamic='force-dynamic';
export default async function UsagePage(){
 const access=await getVerifiedPlatformOwner();if(!access)return null;
 const [meters,usage,subscriptions]=await Promise.all([
  access.client.from('commercial_usage_meters').select('id,meter_key,label,unit_kind,entitlement_key,status').order('created_at',{ascending:false}).limit(1000),
  access.client.from('commercial_metering_events').select('id,institution_id,subscription_id,meter_id,quantity,source_reference,idempotency_key,created_at').order('created_at',{ascending:false}).limit(1000),
  access.client.from('commercial_subscriptions').select('id,institution_id,status').order('created_at',{ascending:false}).limit(1000),
 ]);
 const failed=[meters,usage,subscriptions].some(result=>result.error);
 const choices={meter:(meters.data??[]).filter(m=>m.status==='active').map(m=>({id:m.id,label:`${m.label} (${m.unit_kind})`})),subscription:(subscriptions.data??[]).map(s=>({id:s.id,label:`${s.institution_id} · ${s.status} · ${s.id}`}))};
 return <><section className="sa-page-heading"><div><p className="sa-eyebrow">Subscriptions & revenue</p><h1>Usage meters</h1><p>Append-only usage across a subscription term. Retry with the same operation key and payload to avoid counting twice. Recording usage checks the remaining entitlement atomically.</p></div></section>
 {failed?<CommercialUnavailable/>:<><div className="sa-detail-grid"><CommercialForm command="meter" choices={choices}/><CommercialForm command="usage" choices={choices}/></div>
 <Records title="Meters" rows={meters.data??[]} columns={['label','meter_key','unit_kind','entitlement_key','status','id']}/>
 <Records title="Usage events" rows={usage.data??[]} columns={['institution_id','subscription_id','meter_id','quantity','source_reference','created_at']}/></>}</>;
}
