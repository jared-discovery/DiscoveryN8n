// The trigger's two safety checks, over the BUILT code (npm test builds first). Node's own test runner: no dependency.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { verifySignature, isOwnRecordLink, TOLERANCE_SECONDS } = require('../dist/nodes/DiscoveryOneTrigger/signature.js');

// Made by DiscoveryONE's own signer: its test suite (N8nNodeTests) builds these two headers with WebhookSignature.
const v = JSON.parse(readFileSync(new URL('./signature-vector.json', import.meta.url), 'utf8'));
const body = Buffer.from(v.body, 'utf8');

test('a delivery DiscoveryONE signed is accepted, inside the five minutes either way', () => {
	assert.equal(verifySignature(v.header, body, v.secret, v.t), true);
	assert.equal(verifySignature(v.header, v.body, v.secret, v.t), true);
	assert.equal(verifySignature(v.header, body, v.secret, v.t + TOLERANCE_SECONDS), true);
	assert.equal(verifySignature(v.header, body, v.secret, v.t - TOLERANCE_SECONDS), true);
	assert.equal(verifySignature(v.header.toUpperCase().replace('T=', 't=').replace('V1=', 'v1='), body, v.secret, v.t), true);
});

test('late, early, another secret, another body or no signature is refused', () => {
	assert.equal(verifySignature(v.header, body, v.secret, v.t + TOLERANCE_SECONDS + 1), false);
	assert.equal(verifySignature(v.header, body, v.secret, v.t - TOLERANCE_SECONDS - 1), false);
	assert.equal(verifySignature(v.header, body, v.previousSecret, v.t), false);
	assert.equal(verifySignature(v.header, Buffer.from(v.body.replace('184', '185')), v.secret, v.t), false);
	assert.equal(verifySignature(v.header, Buffer.concat([body, Buffer.from(' ')]), v.secret, v.t), false);
	assert.equal(verifySignature(undefined, body, v.secret, v.t), false);
	assert.equal(verifySignature(v.header, body, undefined, v.t), false);
	assert.equal(verifySignature(v.header, body, '', v.t), false);
});

test('a malformed header is refused, never half-read', () => {
	const sig = v.header.split('v1=')[1];
	for (const h of ['', 'garbage', `v1=${sig}`, `t=${v.t}`, `t=,v1=${sig}`, `t=abc,v1=${sig}`, `t=-${v.t},v1=${sig}`, `t=${v.t},v1=`]) {
		assert.equal(verifySignature(h, body, v.secret, v.t), false, h);
	}
	assert.equal(verifySignature(`t=${v.t},v1=${sig.slice(0, -1)}`, body, v.secret, v.t), false);
});

test('while a secret is being replaced, either one verifies', () => {
	assert.equal(verifySignature(v.rotationHeader, body, v.secret, v.t), true);
	assert.equal(verifySignature(v.rotationHeader, body, v.previousSecret, v.t), true);
	assert.equal(verifySignature(v.rotationHeader, body, 'another-secret-entirely-0123456789', v.t), false);
});

test("the key goes only to a record link on the company's own address, under /api/v1/", () => {
	const base = 'https://discoveryone.app';
	assert.equal(isOwnRecordLink('https://discoveryone.app/api/v1/leads/184', base), true);
	assert.equal(isOwnRecordLink('https://DiscoveryONE.app/api/v1/leads/184', base), true);
	assert.equal(isOwnRecordLink('https://acme.dev.localhost:7184/api/v1/leads/1', 'https://acme.dev.localhost:7184'), true);

	assert.equal(isOwnRecordLink('https://evil.example/api/v1/leads/184', base), false);
	assert.equal(isOwnRecordLink('https://discoveryone.app.evil.example/api/v1/leads/184', base), false);
	assert.equal(isOwnRecordLink('http://discoveryone.app/api/v1/leads/184', base), false);
	assert.equal(isOwnRecordLink('https://discoveryone.app:8443/api/v1/leads/184', base), false);
	assert.equal(isOwnRecordLink('https://user:pw@discoveryone.app/api/v1/leads/184', base), false);
	assert.equal(isOwnRecordLink('https://discoveryone.app/company/api-keys', base), false);
	assert.equal(isOwnRecordLink('https://discoveryone.app/api/v2/leads/184', base), false);
	assert.equal(isOwnRecordLink('/api/v1/leads/184', base), false);
	assert.equal(isOwnRecordLink(184, base), false);
	assert.equal(isOwnRecordLink(undefined, base), false);
	assert.equal(isOwnRecordLink('https://discoveryone.app/api/v1/leads/184', 'http://discoveryone.app'), false);
	assert.equal(isOwnRecordLink('https://discoveryone.app/api/v1/leads/184', 'not a url'), false);
});
