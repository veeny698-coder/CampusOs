import {getVerifiedPlatformOwner} from '../../../../lib/auth/platform-owner';
import {CommercialForm} from '../command-form';
import {Records,CommercialUnavailable} from '../records';
export const dynamic='force-dynamic';
export default async function PlansPage(){
 const access=await getVerifiedPlatformOwner();if(!access)return null;
 const [plans,versions,entitlements]=await Promise.all([
  access.client.from('commercial_plans').select('id,plan_key,name,plan_kind,status').order('created_at',{ascending:false}).limit(1000),
  access.client.from('commercial_plan_versions').select('id,plan_id,version,status,terms_reference').order('created_at',{ascending:false}).limit(1000),
  access.client.from('commercial_plan_entitlements').select('plan_version_id,entitlement_key,enabled,quota_limit').order('created_at',{ascending:false}).limit(1000),
 ]);
 const failed=[plans,versions,entitlements].some(result=>result.error);
 const choices={plan:(plans.data??[]).filter(p=>p.status!=='retired').map(p=>({id:p.id,label:p.name})),version:(versions.data??[]).filter(v=>v.status==='draft').map(v=>({id:v.id,label:`${plans.data?.find(p=>p.id===v.plan_id)?.name??v.plan_id} · v${v.version}`}))};
 return <><section className="sa-page-heading"><div><p className="sa-eyebrow">Subscriptions & revenue</p><h1>Plans & entitlements</h1><p>Draft explicit entitlements, then publish an immutable version. Retiring a plan preserves existing subscriptions.</p></div></section>
 {failed?<CommercialUnavailable/>:<><p className="sa-empty">Quotas apply across the subscription term. Blank quota means unlimited. Prices and legal terms require separate approved inputs.</p>
 <div className="sa-detail-grid">{['plan','version','entitlement','publish','retire'].map(command=><CommercialForm key={command} command={command} choices={choices}/>)}</div>
 <Records title="Plan catalog" rows={plans.data??[]} columns={['name','plan_key','plan_kind','status','id']}/>
 <Records title="Versions" rows={versions.data??[]} columns={['plan_id','version','status','terms_reference','id']}/>
 <Records title="Entitlements" rows={entitlements.data??[]} columns={['plan_version_id','entitlement_key','enabled','quota_limit']}/></>}
 </>;
}
