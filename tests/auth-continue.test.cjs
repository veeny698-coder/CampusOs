const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

const source = fs.readFileSync('app/auth/continue/page.tsx', 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: {
  module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX,
} }).outputText;

function fixture({ user = null, authError = null, owner = null, dbError = null, capabilities=[] } = {}) {
  const calls = [];
  const client = {
    auth: { getUser: async () => ({ data: { user }, error: authError }) },
    rpc:async()=>({data:capabilities,error:null}),
    from(table) {
      calls.push(table);
      return { select(columns) {
        assert.equal(columns, 'user_id');
        return { eq(column, value) {
          assert.equal(column, 'user_id'); assert.equal(value, user.id);
          return { maybeSingle: async () => ({ data: owner, error: dbError }) };
        } };
      } };
    },
  };
  const exports = {};
  vm.runInNewContext(compiled, { exports, require(name) {
    if (name === 'next/navigation') return { redirect(path) { throw new Error(`redirect:${path}`); } };
    if (name.includes('supabase/server')) return { createSupabaseServerClient: async () => client };
    if (name === 'react/jsx-runtime') return require(name);
    throw new Error(`Unexpected dependency: ${name}`);
  } });
  return { run: exports.default, calls };
}

test('anonymous user redirects to login without a role query', async () => {
  const f = fixture();
  await assert.rejects(f.run, /redirect:\/login/); assert.deepEqual(f.calls, []);
});
test('verified platform owner reaches Super Admin', async () => {
  const f = fixture({ user: { id: 'owner' }, owner: { user_id: 'owner' } });
  await assert.rejects(f.run, /redirect:\/super-admin/);
  assert.deepEqual(f.calls, ['platform_owners']);
});
test('tenant user reaches portals despite editable owner metadata', async () => {
  const f = fixture({ user: { id: 'tenant', user_metadata: { role: 'platform_owner' } } });
  await assert.rejects(f.run, /redirect:\/portals/);
});
test('verified audit operator reaches only the audit workspace',async()=>{
  const f=fixture({user:{id:'operator'},capabilities:['audit.read']});
  await assert.rejects(f.run,/redirect:\/super-admin\/audit/);
});
test('auth verification error denies even a returned user object', async () => {
  const f = fixture({ user: { id: 'owner' }, authError: { message: 'invalid' } });
  await assert.rejects(f.run, /redirect:\/login/); assert.deepEqual(f.calls, []);
});
test('database permission failure displays a recoverable error', async () => {
  const f = fixture({ user: { id: 'owner' }, dbError: { message: 'unavailable' } });
  const result = await f.run();
  assert.equal(result.props.role, 'alert');
});
