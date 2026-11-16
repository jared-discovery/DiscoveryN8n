import { createHmac, timingSafeEqual } from 'crypto';

/*  DiscoveryONE signs every delivery the way Stripe does (its WebhookSignature):
        X-DiscoveryOne-Signature: t=<unix seconds>,v1=<hex HMAC-SHA256 of "<t>.<raw body>" with the signing secret>
    with five minutes' tolerance, and two v1 values while a secret is being replaced — either one may match.
    The signature is over the RAW body, byte for byte: never a re-serialized copy. */
export const SIGNATURE_HEADER = 'x-discoveryone-signature';
export const TOLERANCE_SECONDS = 300;

export function verifySignature(
	header: string | undefined,
	rawBody: Buffer | string,
	secret: string | undefined,
	nowSeconds: number,
	toleranceSeconds = TOLERANCE_SECONDS,
): boolean {
	if (!header || !secret) return false;
	let t = 0;
	const v1s: string[] = [];
	for (const part of header.split(',')) {
		const at = part.indexOf('=');
		if (at < 0) continue;
		const name = part.slice(0, at).trim();
		const value = part.slice(at + 1).trim();
		if (name === 't' && new RegExp('^[0-9]+$').test(value)) t = Number(value);
		else if (name === 'v1' && value.length > 0) v1s.push(value.toLowerCase());
	}
	if (t <= 0 || v1s.length === 0) return false;
	if (Math.abs(nowSeconds - t) > toleranceSeconds) return false;

	const body = typeof rawBody === 'string' ? Buffer.from(rawBody, 'utf8') : rawBody;
	const expected = Buffer.from(createHmac('sha256', secret).update(`${t}.`).update(body).digest('hex'), 'utf8');
	return v1s.some((v1) => {
		const candidate = Buffer.from(v1, 'utf8');
		return candidate.length === expected.length && timingSafeEqual(candidate, expected);
	});
}

/*  An event carries a link to its record. The key is sent to it ONLY when the link is on the company's own web address,
    under /api/v1/ — a forged or unexpected link never carries the key anywhere else. */
export function isOwnRecordLink(link: unknown, baseUrl: string): link is string {
	if (typeof link !== 'string' || !URL.canParse(link) || !URL.canParse(baseUrl)) return false;
	const target = new URL(link);
	const own = new URL(baseUrl);
	return (
		target.protocol === 'https:' &&
		own.protocol === 'https:' &&
		target.host.toLowerCase() === own.host.toLowerCase() &&
		target.username === '' &&
		target.password === '' &&
		target.pathname.startsWith('/api/v1/') &&
		!target.pathname.includes('/../')
	);
}
