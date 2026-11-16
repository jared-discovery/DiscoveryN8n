import {
	NodeApiError,
	NodeConnectionTypes,
	NodeOperationError,
	type IDataObject,
	type IHookFunctions,
	type INodeType,
	type INodeTypeDescription,
	type IWebhookFunctions,
	type IWebhookResponseData,
	type JsonObject,
} from 'n8n-workflow';
import { apiRequest, baseUrlOf, CREDENTIAL } from '../DiscoveryOne/shared/transport';
import { EVENTS } from './events';
import { isOwnRecordLink, SIGNATURE_HEADER, verifySignature } from './signature';

/*  Starts a workflow when something happens in DiscoveryONE. Turning the workflow on makes a webhook THE KEY owns
    (POST /api/v1/hooks, which needs the key's "Connect apps" tick); turning it off deletes it. The webhook's id and its
    signing secret — given once, when it is made — are kept with this node, and every delivery is checked against it. */
export class DiscoveryOneTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'DiscoveryONE Trigger',
		name: 'discoveryOneTrigger',
		icon: { light: 'file:../../icons/discoveryone.svg', dark: 'file:../../icons/discoveryone.dark.svg' },
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["events"].join(", ")}}',
		description: 'Starts the workflow when something happens in DiscoveryONE',
		defaults: { name: 'DiscoveryONE Trigger' },
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: CREDENTIAL, required: true }],
		webhooks: [{ name: 'default', httpMethod: 'POST', responseMode: 'onReceived', path: 'webhook' }],
		properties: [
			{
				displayName: 'Events',
				name: 'events',
				type: 'multiOptions',
				required: true,
				default: [],
				options: EVENTS,
				description: 'What to start the workflow for. The key hears only events about records it may read.',
			},
			{
				displayName: 'Fetch the Record',
				name: 'fetchRecord',
				type: 'boolean',
				default: true,
				description:
					'Whether to read the record the event is about and add it as "record". An event itself carries only its type, its ID and a link.',
			},
		],
	};

	webhookMethods = {
		default: {
			// Ours, live, and listening for exactly the events chosen now. Anything else is deleted and made again.
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const data = this.getWorkflowStaticData('node');
				if (data.webhookId === undefined || !data.signingSecret) return false;
				const answer = await apiRequest.call(this, 'GET', '/api/v1/hooks');
				const hook = ((answer.data as IDataObject[]) ?? []).find((h) => h.id === data.webhookId);
				const wanted = [...(this.getNodeParameter('events') as string[])].sort().join(',');
				const listening = hook ? [...((hook.events as string[]) ?? [])].sort().join(',') : '';
				if (hook && hook.active === true && listening === wanted) return true;
				if (hook) await apiRequest.call(this, 'DELETE', `/api/v1/hooks/${String(data.webhookId)}`);
				delete data.webhookId;
				delete data.signingSecret;
				return false;
			},

			async create(this: IHookFunctions): Promise<boolean> {
				const url = this.getNodeWebhookUrl('default') as string;
				if (!url.startsWith('https://')) {
					throw new NodeOperationError(this.getNode(), 'DiscoveryONE sends events only to https:// addresses', {
						description: `This n8n's webhook address is ${url}. Give n8n a public https address (its WEBHOOK_URL setting) and turn the workflow on again.`,
					});
				}
				const events = this.getNodeParameter('events') as string[];
				const name = this.getWorkflow().name ?? 'a workflow';
				let answer: IDataObject;
				try {
					answer = await apiRequest.call(this, 'POST', '/api/v1/hooks', {
						url,
						events,
						description: `n8n: ${name}`.slice(0, 200),
					});
				} catch (error) {
					throw new NodeApiError(this.getNode(), error as JsonObject, {
						message: "DiscoveryONE didn't make the webhook",
						description:
							'The key needs the "Connect apps" tick (Settings → API keys), and may listen only for events about records it may read.',
					});
				}
				const data = this.getWorkflowStaticData('node');
				data.webhookId = (answer.hook as IDataObject).id;
				data.signingSecret = answer.secret;
				return true;
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const data = this.getWorkflowStaticData('node');
				if (data.webhookId !== undefined) {
					try {
						await apiRequest.call(this, 'DELETE', `/api/v1/hooks/${String(data.webhookId)}`);
					} catch (error) {
						// Already gone (deleted on the Webhooks page, or with its key) is what we wanted.
						if ((error as JsonObject).httpCode !== '404') {
							throw new NodeApiError(this.getNode(), error as JsonObject, {
								message: "DiscoveryONE didn't delete the webhook",
							});
						}
					}
				}
				delete data.webhookId;
				delete data.signingSecret;
				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const request = this.getRequestObject();
		if (!request.rawBody) await request.readRawBody();
		const secret = this.getWorkflowStaticData('node').signingSecret as string | undefined;
		const header = request.header(SIGNATURE_HEADER);
		if (!verifySignature(header, request.rawBody, secret, Math.floor(Date.now() / 1000))) {
			this.getResponseObject().status(401).send('Unauthorized').end();
			return { noWebhookResponse: true };
		}

		const event = this.getBodyData() as IDataObject;
		if (!(this.getNodeParameter('fetchRecord', true) as boolean)) {
			return { workflowData: [this.helpers.returnJsonArray(event)] };
		}

		const link = (event.resource as IDataObject | undefined)?.url;
		const credentials = await this.getCredentials(CREDENTIAL);
		const base = baseUrlOf(credentials);
		let record: IDataObject | null = null;
		let recordError: string | undefined;
		if (!isOwnRecordLink(link, base)) {
			recordError = `The event's link isn't on ${base}, so the key wasn't sent to it.`;
		} else {
			try {
				record = (await this.helpers.httpRequestWithAuthentication.call(this, CREDENTIAL, {
					method: 'GET',
					url: link,
					json: true,
				})) as IDataObject;
			} catch (error) {
				// The event still starts the workflow: the record may be gone, or the key may no longer read it.
				recordError = `Couldn't read the record: ${(error as Error).message}`;
			}
		}
		return {
			workflowData: [this.helpers.returnJsonArray({ ...event, record, ...(recordError ? { recordError } : {}) })],
		};
	}
}
