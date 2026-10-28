'use client';
import {useActionState} from 'react';
import {commercialCommands} from '../../../lib/commercial/commands';
import {saveCommercialCommand} from './command-action';
export type CommercialChoices=Record<string,{id:string;label:string}[]>;
export function CommercialForm({command,choices={}}:{command:string;choices?:CommercialChoices}){
 const spec=commercialCommands[command];
 const [state,action,pending]=useActionState(saveCommercialCommand,{ok:false,message:''});
 return <details className="sa-panel sa-panel--form"><summary>{spec.label}</summary><form className="sa-form" action={action}>
  <input type="hidden" name="command" value={command}/>
  {spec.fields.map(field=><label key={field.name}>{field.label}
   {field.type==='uuid'&&choices[field.name]?<select name={field.name} required={field.required}><option value="">Choose {field.label.toLowerCase()}</option>{choices[field.name].map(item=><option key={item.id} value={item.id}>{item.label}</option>)}</select>
    :field.type==='choice'||field.type==='boolean'?<select name={field.name} required={field.required}><option value="">Choose</option>{(field.choices??['true','false']).map(value=><option key={value} value={value}>{value}</option>)}</select>
    :<input name={field.name} required={field.required} type={field.type==='date'?'datetime-local':field.type==='integer'?'number':'text'} min={field.type==='integer'?0:undefined} step={field.type==='integer'?1:undefined} maxLength={field.max??(field.type==='uuid'?36:200)}/>}
  </label>)}
  <label>Reason<textarea name="reason" required minLength={3} maxLength={500}/></label>
  <label className="sa-check"><input type="checkbox" name="confirmed" value="yes" required/>I have reviewed and confirm this change.</label>
  <button disabled={pending}>{pending?'Saving…':spec.label}</button>
  {state.message&&<p role="status" className={state.ok?'sa-form__success':'sa-form__error'}>{state.message}</p>}
 </form></details>;
}
