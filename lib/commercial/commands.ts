export type CommercialField = { name: string; label: string; type: 'uuid'|'text'|'key'|'date'|'integer'|'boolean'|'choice'; required?: boolean; choices?: string[]; max?: number };
export type CommercialCommand = { label: string; rpc: string; fields: CommercialField[] };
const id = (name:string,label:string,required=true):CommercialField=>({name,label,type:'uuid',required});
const text = (name:string,label:string,max=200,required=true):CommercialField=>({name,label,type:'text',max,required});
const choice = (name:string,label:string,choices:string[]):CommercialField=>({name,label,type:'choice',choices,required:true});
const date = (name:string,label:string,required=false):CommercialField=>({name,label,type:'date',required});
export const commercialCommands:Record<string,CommercialCommand> = {
 plan:{label:'Create plan',rpc:'create_commercial_plan',fields:[{name:'key',label:'Plan key',type:'key',required:true},text('name','Plan name',120),choice('kind','Plan kind',['complimentary','trial','paid','enterprise'])]},
 version:{label:'Create draft version',rpc:'create_commercial_plan_version',fields:[id('plan','Plan'),text('terms_reference','Approved terms reference',500,false)]},
 entitlement:{label:'Set draft entitlement',rpc:'set_commercial_entitlement',fields:[id('version','Draft version'),{name:'key',label:'Entitlement key',type:'key',required:true},{name:'enabled',label:'Enabled',type:'boolean',required:true},{name:'limit',label:'Term quota (blank means unlimited)',type:'integer'}]},
 publish:{label:'Publish version',rpc:'publish_commercial_version',fields:[id('version','Draft version')]},
 retire:{label:'Retire plan',rpc:'retire_commercial_plan',fields:[id('plan','Plan')]},
 contract:{label:'Create contract reference',rpc:'create_commercial_contract',fields:[id('institution','Institution'),text('reference','Existing contract reference'),date('starts_at','Term starts (UTC)'),date('ends_at','Term ends (UTC)')]},
 contract_state:{label:'Change contract state',rpc:'transition_commercial_contract',fields:[id('contract','Contract'),choice('status','Next state',['negotiating','signed','expired','cancelled'])]},
 subscription:{label:'Start subscription',rpc:'create_commercial_subscription',fields:[id('institution','Institution'),id('plan_version','Published version'),id('contract','Signed contract (optional)',false),choice('status','Initial state',['trial','active']),date('starts_at','Starts (UTC)',true),date('ends_at','Ends (UTC)')]},
 subscription_state:{label:'Change subscription state',rpc:'transition_commercial_subscription',fields:[id('subscription','Subscription'),choice('status','Next state',['active','grace','suspended','cancelled'])]},
 billing:{label:'Record billing reference',rpc:'record_commercial_billing',fields:[id('institution','Institution'),id('subscription','Subscription (optional)',false),choice('type','Record type',['quote','invoice','credit','payment','adjustment']),text('reference','Existing external reference'),date('occurred_at','Occurred (UTC)',true)]},
 billing_state:{label:'Change billing state',rpc:'transition_commercial_billing',fields:[id('record','Billing record'),choice('status','Next state',['void','settled'])]},
 meter:{label:'Create usage meter',rpc:'create_commercial_meter',fields:[{name:'key',label:'Meter key',type:'key',required:true},text('label','Label',120),choice('unit','Unit',['count','bytes','units']),{name:'entitlement',label:'Entitlement key',type:'key',required:true}]},
 usage:{label:'Record usage',rpc:'record_commercial_usage',fields:[id('subscription','Subscription'),id('meter','Meter'),{name:'quantity',label:'Quantity',type:'integer',required:true},text('idempotency_key','Unique source operation key'),text('source','Source reference',500)]},
};

export function parseCommercialCommand(form:FormData) {
 const command=String(form.get('command')??'');
 if(!Object.hasOwn(commercialCommands,command))throw Error('Unknown operation.');
 if(form.get('confirmed')!=='yes')throw Error('Confirm this commercial change.');
 const reason=String(form.get('reason')??'').trim();
 if(reason.length<3||reason.length>500)throw Error('Provide a reason of 3–500 characters.');
 const spec=commercialCommands[command]; const args:Record<string,string|number|boolean|null>={};
 for(const field of spec.fields){
  const value=String(form.get(field.name)??'').trim(); let parsed:string|number|boolean|null=value||null;
  if(!value&&field.required)throw Error(`${field.label} is required.`);
  if(value){
   if(field.type==='uuid'&&!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value))throw Error(`Choose a valid ${field.label.toLowerCase()}.`);
   if(field.type==='key'&&!/^[a-z][a-z0-9_]{2,79}$/.test(value))throw Error('Keys must use lowercase letters, numbers and underscores.');
   if(field.type==='text'&&(value.length<2||value.length>(field.max??200)))throw Error(`${field.label} has an invalid length.`);
   if(field.type==='choice'&&!field.choices?.includes(value))throw Error(`Choose a valid ${field.label.toLowerCase()}.`);
   if(field.type==='boolean'){if(!['true','false'].includes(value))throw Error('Choose an enabled state.');parsed=value==='true';}
   if(field.type==='integer'){if(!/^\d+$/.test(value)||!Number.isSafeInteger(Number(value)))throw Error('Quantity must be a non-negative safe integer.');parsed=Number(value);}
   if(field.type==='date'){const stamp=Date.parse(value.endsWith('Z')?value:`${value}Z`);if(!Number.isFinite(stamp))throw Error('Enter a valid UTC date.');parsed=new Date(stamp).toISOString();}
  }
  args[`p_${field.name}`]=parsed;
 }
 if(command==='usage'&&(Number(args.p_quantity)<=0||String(args.p_idempotency_key).length<8))throw Error('Usage needs a positive quantity and an operation key of at least 8 characters.');
 args.p_reason=reason;
 return {rpc:spec.rpc,args};
}
