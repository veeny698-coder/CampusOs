import {getVerifiedPlatformOwner} from '../../../../lib/auth/platform-owner';
import {CommercialForm} from '../command-form';
import {Records,CommercialUnavailable} from '../records';
export const dynamic='force-dynamic';
export default async function SubscriptionsPage(){
 const access=await getVerifiedPlatformOwner();if(!access)return null;
 const [institutions,subscriptions,versions,contracts]=await Promise.all([
  access.client.from('institutions').select('id,name').eq('lifecycle_status','active').order('name').limit(1000),
  access.client.from('commercial_subscriptions').select('id,institution_id,plan_version_id,contract_id,status,starts_at,ends_at').order('created_at',{ascending:false}).limit(1000),
  access.client.from('commercial_plan_versions').select('id,plan_id,version').eq('status','published').order('created_at',{ascending:false}).limit(1000),
  access.client.from('commercial_contracts').select('id,contract_reference,institution_id').eq('status','signed').order('created_at',{ascending:false}).limit(1000),
 ]);
 const failed=[institutions,subscriptions,versions,contracts].some(result=>result.error);
 const choices={institution:(institutions.data??[]).map(i=>({id:i.id,label:i.name})),subscription:(subscriptions.data??[]).filter(s=>s.status!=='cancelled').map(s=>({id:s.id,label:`${institutions.data?.find(i=>i.id===s.institution_id)?.name??s.institution_id} · ${s.status} · ${s.id}`})),plan_version:(versions.data??[]).map(v=>({id:v.id,label:`${v.plan_id} · v${v.version}`})),contract:(contracts.data??[]).map(c=>({id:c.id,label:`${c.contract_reference} · ${institutions.data?.find(i=>i.id===c.institution_id)?.name??c.institution_id}`}))};
 return <><section className="sa-page-heading"><div><p className="sa-eyebrow">Subscriptions & revenue</p><h1>Subscriptions</h1><p>Use published terms and an optional signed contract from the same institution. Cancellation is final. Suspending stops entitlement checks; restoring requires an allowed transition.</p></div></section>
 {failed?<CommercialUnavailable/>:<><div className="sa-detail-grid"><CommercialForm command="subscription" choices={choices}/><CommercialForm command="subscription_state" choices={choices}/></div>
 <Records title="Subscriptions" rows={subscriptions.data??[]} columns={['institution_id','status','starts_at','ends_at','plan_version_id','id']}/></>}</>;
}
