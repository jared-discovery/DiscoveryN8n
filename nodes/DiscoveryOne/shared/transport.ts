import type {
	IDataObject,
	IExecuteSingleFunctions,
	IHookFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	ILoadOptionsFunctions,
	IWebhookFunctions,
} from 'n8n-workflow';

export const CREDENTIAL = 'discoveryOneApi';

type Context = IHookFunctions | ILoadOptionsFunctions | IWebhookFunctions | IExecuteSingleFunctions;

// The company's web address, without a trailing slash: every request is built on it.
export function baseUrlOf(credentials: IDataObject): string {
	return String(credentials.baseUrl ?? '').trim().replace(new RegExp('/+$'), '');
}

// One call to the company's own API with its key, for the code that isn't declarative (choices, the trigger).
export async function apiRequest(
	this: Context,
	method: IHttpRequestMethods,
	path: string,
	body?: IDataObject,
): Promise<IDataObject> {
	const credentials = await this.getCredentials(CREDENTIAL);
	const options: IHttpRequestOptions = {
		method,
		url: `${baseUrlOf(credentials)}${path}`,
		json: true,
	};
	if (body !== undefined) options.body = body;
	return (await this.helpers.httpRequestWithAuthentication.call(this, CREDENTIAL, options)) as IDataObject;
}
