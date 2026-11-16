import {
	NodeApiError,
	type DeclarativeRestApiSettings,
	type IDataObject,
	type IExecutePaginationFunctions,
	type IExecuteSingleFunctions,
	type IHttpRequestOptions,
	type IN8nHttpFullResponse,
	type INodeExecutionData,
	type JsonObject,
} from 'n8n-workflow';

// The API's own ceiling on one page (ApiListQuery.MaxLimit).
export const PAGE_MAX = 200;

/*  An error the API answered, said so the person can fix it. Every resource sends its requests with
    ignoreHttpStatusErrors and runs this first. ⚠ A 404 is ALSO what a key gets for a record it may not read — on purpose,
    so a key can't learn what exists — so the sentence names both causes rather than guessing which. */
export async function apiErrors(
	this: IExecuteSingleFunctions,
	items: INodeExecutionData[],
	response: IN8nHttpFullResponse,
): Promise<INodeExecutionData[]> {
	const status = response.statusCode;
	if (status < 400) return items;
	const body = (
		typeof response.body === 'object' && response.body !== null ? response.body : {}
	) as JsonObject;
	const said = typeof body.message === 'string' ? body.message : undefined;
	const [message, description] =
		status === 404
			? [
					'DiscoveryONE has no such record for this key',
					'Check the ID. A record the key may not read answers the same way: on Settings → API keys, the key needs the View tick for it (and What it may change, to change it).',
				]
			: status === 401
				? [
						'The API key was refused',
						'It may have been revoked. Make a new key on Settings → API keys and put it in this credential.',
					]
				: status === 429
					? [
							'Too many calls',
							'A key may make 120 calls a minute. Wait a minute, or spread the workflow out.',
						]
					: status >= 500
						? ['DiscoveryONE could not answer just now', said ?? 'Try again in a moment.']
						: [
								said ?? 'DiscoveryONE refused the request',
								'The message above is what DiscoveryONE said about it.',
							];
	throw new NodeApiError(this.getNode(), body, { message, description, httpCode: String(status) });
}

/*  Get Many: the API pages by `after`, answering { data, next, more }, oldest change first. Every page keeps the filters
    the operation set (a generic paginator would replace the whole query and drop them), and stops at the limit unless
    Return All is on. */
export async function listPages(
	this: IExecutePaginationFunctions,
	requestOptions: DeclarativeRestApiSettings.ResultOptions,
): Promise<INodeExecutionData[]> {
	const returnAll = this.getNodeParameter('returnAll', false) as boolean;
	const limit = returnAll
		? Number.POSITIVE_INFINITY
		: (this.getNodeParameter('limit', 50) as number);
	const simplify = this.getNodeParameter('simplify', false) as boolean;
	const results: INodeExecutionData[] = [];
	const qs = (requestOptions.options.qs ?? {}) as IDataObject;
	requestOptions.options.qs = qs;
	let after: string | undefined;

	for (;;) {
		qs.limit = Math.min(PAGE_MAX, limit - results.length);
		if (after === undefined) delete qs.after;
		else qs.after = after;

		const answer = await this.makeRoutingRequest(requestOptions);
		const page = (answer[0]?.json ?? {}) as IDataObject;
		for (const record of (page.data as IDataObject[] | undefined) ?? []) {
			results.push({ json: simplify ? simplified(record) : record });
		}
		if (page.more !== true || results.length >= limit) break;
		after = page.next as string;
	}
	return results.slice(0, limit);
}

// Lead's answer has more than ten fields; Simplify keeps the ones most flows use (n8n's UX guideline).
export const SIMPLE_LEAD_FIELDS = [
	'id',
	'name',
	'company',
	'email',
	'phone',
	'status',
	'statusName',
	'estimatedValue',
	'createdDate',
	'nextFollowUp',
];

function simplified(record: IDataObject): IDataObject {
	const out: IDataObject = {};
	for (const key of SIMPLE_LEAD_FIELDS) if (key in record) out[key] = record[key];
	return out;
}

export async function simplifyOne(
	this: IExecuteSingleFunctions,
	items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
	if (this.getNodeParameter('operation', '') !== 'get' || !this.getNodeParameter('simplify', false))
		return items;
	return items.map((item) => ({ ...item, json: simplified(item.json) }));
}

/*  A create sends an Idempotency-Key made from this execution, this node, its run and the item — so n8n's "Retry On Fail"
    gets the record the first try made instead of a second one, and two create nodes in one workflow never share a key.
    The API takes 8–200 letters, digits, underscores, dots, colons or dashes. */
export async function idempotencyKey(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	const itemIndex = this.getItemIndex();
	const runIndex = this.getWorkflowDataProxy(itemIndex).$runIndex as number;
	const raw = `n8n:${this.getExecutionId()}:${this.getNode().id}:${runIndex}:${itemIndex}`;
	const key = raw.replace(new RegExp('[^A-Za-z0-9_.:-]', 'g'), '-').slice(0, 200);
	requestOptions.headers = { ...(requestOptions.headers ?? {}), 'Idempotency-Key': key };
	return requestOptions;
}

/*  Custom fields go as { name: text }. The fixed collection holds rows of name and value; an empty value clears the
    field, as the API reads null. */
export async function customFieldsBody(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	const group =
		this.getNodeParameter('operation', '') === 'update' ? 'updateFields' : 'additionalFields';
	const holder = (this.getNodeParameter(group, {}) as IDataObject).customFields as
		| IDataObject
		| undefined;
	const rows = (holder?.field as IDataObject[] | undefined) ?? [];
	if (rows.length === 0) return requestOptions;
	const fields: IDataObject = {};
	for (const row of rows) {
		const name = String(row.name ?? '').trim();
		if (name) fields[name] = row.value === '' || row.value === undefined ? null : String(row.value);
	}
	const body = (requestOptions.body ?? {}) as IDataObject;
	body.customFields = fields;
	requestOptions.body = body;
	return requestOptions;
}
