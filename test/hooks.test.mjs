// The action node's own code — the paginator and the two body hooks — over the BUILT code, with n8n's context faked.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { listPages, idempotencyKey, customFieldsBody, simplifyOne, PAGE_MAX } = require('../dist/nodes/DiscoveryOne/shared/hooks.js');

// A list of `total` records the API pages oldest change first, answering { data, next, more } like ApiPage.
function api(total) {
	const asked = [];
	return {
		asked,
		async makeRoutingRequest(options) {
			const qs = { ...options.options.qs };
			asked.push(qs);
			const start = qs.after === undefined ? 0 : Number(qs.after);
			const data = Array.from({ length: Math.max(0, Math.min(qs.limit, total - start)) }, (_, i) => ({
				id: start + i + 1,
				name: `Lead ${start + i + 1}`,
				company: 'x',
				source: 'y',
			}));
			return [{ json: { data, next: String(start + data.length), more: start + data.length < total } }];
		},
	};
}

function context(params, fake) {
	return {
		getNodeParameter: (name, fallback) => (name in params ? params[name] : fallback),
		makeRoutingRequest: fake.makeRoutingRequest,
	};
}

test('Get Many stops at the limit, asking for no more than it needs', async () => {
	const fake = api(500);
	const items = await listPages.call(context({ returnAll: false, limit: 7 }, fake), {
		options: { qs: { status: 'New' } },
	});
	assert.equal(items.length, 7);
	assert.deepEqual(fake.asked, [{ status: 'New', limit: 7 }]);
});

test('Return All walks every page and keeps the filters on each one', async () => {
	const fake = api(450);
	const items = await listPages.call(context({ returnAll: true }, fake), { options: { qs: { status: 'New' } } });
	assert.equal(items.length, 450);
	assert.deepEqual(
		items.map((i) => i.json.id),
		Array.from({ length: 450 }, (_, i) => i + 1),
	);
	assert.deepEqual(fake.asked, [
		{ status: 'New', limit: PAGE_MAX },
		{ status: 'New', limit: PAGE_MAX, after: '200' },
		{ status: 'New', limit: PAGE_MAX, after: '400' },
	]);
});

test('a limit over one page takes the rest from the next, exactly', async () => {
	const fake = api(1000);
	const items = await listPages.call(context({ returnAll: false, limit: 250 }, fake), { options: {} });
	assert.equal(items.length, 250);
	assert.deepEqual(
		fake.asked.map((q) => [q.limit, q.after]),
		[
			[200, undefined],
			[50, '200'],
		],
	);
});

test('an empty list is no items, asked once', async () => {
	const fake = api(0);
	assert.deepEqual(await listPages.call(context({ returnAll: true }, fake), { options: {} }), []);
	assert.equal(fake.asked.length, 1);
});

test('Simplify keeps the lead fields most flows use, on Get Many and on Get', async () => {
	const fake = api(1);
	const [many] = await listPages.call(context({ returnAll: true, simplify: true }, fake), { options: {} });
	assert.deepEqual(Object.keys(many.json).sort(), ['company', 'id', 'name']);
	const one = { json: { id: 3, name: 'A', source: 'web', teamId: 2, status: 'New' } };
	const get = (simplify, operation = 'get') => ({ getNodeParameter: (n, f) => ({ simplify, operation })[n] ?? f });
	assert.deepEqual((await simplifyOne.call(get(true), [one]))[0].json, { id: 3, name: 'A', status: 'New' });
	assert.deepEqual((await simplifyOne.call(get(false), [one]))[0].json, one.json);
	assert.deepEqual((await simplifyOne.call(get(true, 'getAll'), [one]))[0].json, one.json);
});

test('the Idempotency-Key is the same on a retry and different for another node, run or item', async () => {
	const key = async (execution, node, run, item) => {
		const options = await idempotencyKey.call(
			{
				getItemIndex: () => item,
				getExecutionId: () => execution,
				getNode: () => ({ id: node }),
				getWorkflowDataProxy: () => ({ $runIndex: run }),
			},
			{ headers: { Accept: 'application/json' } },
		);
		assert.equal(options.headers.Accept, 'application/json');
		return options.headers['Idempotency-Key'];
	};
	const k = await key('1042', '6f1c0b2a-1d2e-4f30-9a8b-1c2d3e4f5a6b', 0, 3);
	assert.match(k, new RegExp('^[A-Za-z0-9_.:-]{8,200}$'));
	assert.equal(await key('1042', '6f1c0b2a-1d2e-4f30-9a8b-1c2d3e4f5a6b', 0, 3), k);
	assert.notEqual(await key('1042', 'another-node', 0, 3), k);
	assert.notEqual(await key('1042', '6f1c0b2a-1d2e-4f30-9a8b-1c2d3e4f5a6b', 1, 3), k);
	assert.notEqual(await key('1042', '6f1c0b2a-1d2e-4f30-9a8b-1c2d3e4f5a6b', 0, 4), k);
	assert.notEqual(await key('1043', '6f1c0b2a-1d2e-4f30-9a8b-1c2d3e4f5a6b', 0, 3), k);
	assert.match(await key('a b/c', 'n', 0, 0), new RegExp('^[A-Za-z0-9_.:-]+$'));
});

test('custom fields go as { name: text }, an empty value clearing one, from the fields of this operation', async () => {
	const run = async (operation, group, rows, body = { name: 'A' }) =>
		(
			await customFieldsBody.call(
				{ getNodeParameter: (n, f) => (n === 'operation' ? operation : n === group ? { customFields: { field: rows } } : f) },
				{ body },
			)
		).body;
	assert.deepEqual(await run('create', 'additionalFields', [{ name: 'Roof', value: 'Metal' }, { name: 'Gate', value: '' }]), {
		name: 'A',
		customFields: { Roof: 'Metal', Gate: null },
	});
	assert.deepEqual(await run('update', 'updateFields', [{ name: 'Roof', value: 'Tile' }]), {
		name: 'A',
		customFields: { Roof: 'Tile' },
	});
	assert.deepEqual(await run('create', 'additionalFields', []), { name: 'A' });
	assert.deepEqual(await run('update', 'additionalFields', [{ name: 'Roof', value: 'x' }]), { name: 'A' });
});

test('an error the API answers is said with what to do; a success passes through', async () => {
	const { apiErrors: errors } = require('../dist/nodes/DiscoveryOne/shared/hooks.js');
	const ctx = { getNode: () => ({ name: 'DiscoveryONE', type: 'n8n-nodes-discoveryone.discoveryOne', typeVersion: 1, parameters: {} }) };
	const ok = [{ json: { id: 1 } }];
	assert.equal(await errors.call(ctx, ok, { statusCode: 200, body: {}, headers: {} }), ok);
	const said = async (statusCode, body) => {
		try {
			await errors.call(ctx, ok, { statusCode, body, headers: {} });
		} catch (e) {
			return [e.message, e.description];
		}
		assert.fail('no error for ' + statusCode);
	};
	const [notFound, why] = await said(404, { error: 'not_found', message: 'No such record.' });
	assert.equal(notFound, 'DiscoveryONE has no such record for this key');
	assert.match(why, new RegExp('View tick'));
	assert.equal((await said(401, {}))[0], 'The API key was refused');
	assert.equal((await said(429, {}))[0], 'Too many calls');
	assert.equal((await said(400, { error: 'bad_request', message: 'limit must be a whole number from 1 to 200.' }))[0],
		'limit must be a whole number from 1 to 200.');
	assert.equal((await said(503, { message: 'Down for a moment.' }))[1], 'Down for a moment.');
});

test('every resource answers through apiErrors, and the node lets every status reach it', () => {
	const { DiscoveryOne } = require('../dist/nodes/DiscoveryOne/DiscoveryOne.node.js');
	const { apiErrors: errors } = require('../dist/nodes/DiscoveryOne/shared/hooks.js');
	const description = new DiscoveryOne().description;
	assert.equal(description.requestDefaults.ignoreHttpStatusErrors, true);
	const resources = description.properties.find((p) => p.name === 'resource').options;
	assert.equal(resources.length, 9);
	for (const r of resources) assert.equal(r.routing?.output?.postReceive?.[0], errors, r.name);
});
