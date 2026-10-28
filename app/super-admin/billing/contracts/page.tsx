import {getVerifiedPlatformOwner} from '../../../../lib/auth/platform-owner';
import {CommercialForm} from '../command-form';
import {Records,CommercialUnavailable} from '../records';
export const dynamic='force-dynamic';
export default async function ContractsPage(){
 const access=await getVerifiedPlatformOwner();if(!access)return null;
 const [institutions,contracts,billing,subscriptions]=await Promise.all([
  access.client.from('institutions').select('id,name').order('name').limit(1000),
  access.client.from('commercial_contracts').select('id,institution_id,contract_reference,status,starts_at,ends_at').order('created_at',{ascending:false}).limit(1000),
  access.client.from('commercial_billing_records').select('id,institution_id,subscription_id,record_type,external_reference,status,occurred_at').order('created_at',{ascending:false}).limit(1000),
  access.client.from('commercial_subscriptions').select('id,institution_id,status').order('created_at',{ascending:false}).limit(1000),
 ]);
 const failed=[institutions,contracts,billing,subscriptions].some(result=>result.error);
 const choices={institution:(institutions.data??[]).map(i=>({id:i.id,label:i.name})),contract:(contracts.data??[]).map(c=>({id:c.id,label:`${c.contract_reference} · ${c.status}`})),subscription:(subscriptions.data??[]).map(s=>({id:s.id,label:`${institutions.data?.find(i=>i.id===s.institution_id)?.name??s.institution_id} · ${s.status} · ${s.id}`})),record:(billing.data??[]).filter(b=>b.status==='recorded').map(b=>({id:b.id,label:b.external_reference}))};
 return <><section className="sa-page-heading"><div><p className="sa-eyebrow">Subscriptions & revenue</p><h1>Contracts & billing records</h1><p>Record references to approved external documents. Signing records an existing agreement; it does not generate or sign a legal document. Settlement records an external outcome and does not collect money.</p></div></section>
 {failed?<CommercialUnavailable/>:<><div className="sa-detail-grid">{['contract','contract_state','billing','billing_state'].map(command=><CommercialForm key={command} command={command} choices={choices}/>)}</div>
 <Records title="Contracts" rows={contracts.data??[]} columns={['contract_reference','institution_id','status','starts_at','ends_at','id']}/>
 <Records title="Billing references" rows={billing.data??[]} columns={['external_reference','institution_id','record_type','status','occurred_at','id']}/></>}</>;
}
