// Read-only anonymous route smoke check against an already-running local build.
const assert=require('node:assert/strict');
const base=new URL(process.argv[2]??'http://localhost:3102');
assert.ok(['localhost','127.0.0.1'].includes(base.hostname),'Only a local test server is allowed');
const routes=['/login','/auth/continue','/super-admin','/super-admin/audit','/super-admin/team','/super-admin/access/roles','/super-admin/access/portals','/super-admin/billing/plans','/super-admin/billing/subscriptions','/super-admin/billing/contracts','/super-admin/billing/usage','/portals'];
(async()=>{
 for(const route of routes){
  const response=await fetch(new URL(route,base),{redirect:'manual',signal:AbortSignal.timeout(20000)});
  const location=response.headers.get('location');
  if(route==='/login')assert.equal(response.status,200);
  else{assert.equal(response.status,307,route);assert.equal(new URL(location,base).pathname,'/login',route);}
  console.log(`${route}: ${response.status}${location?` -> ${location}`:''}`);
 }
})().catch(error=>{console.error(error.message);process.exitCode=1;});
