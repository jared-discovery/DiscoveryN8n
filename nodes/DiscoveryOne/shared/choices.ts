import {
	NodeApiError,
	type IDataObject,
	type ILoadOptionsFunctions,
	type INodePropertyOptions,
} from 'n8n-workflow';
import { apiRequest } from './transport';

// The company's own lead statuses (GET /api/v1/lead-statuses): each name, and the kind of status it is.
export async function getLeadStatuses(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	try {
		const answer = await apiRequest.call(this, 'GET', '/api/v1/lead-statuses');
		return ((answer.data as IDataObject[]) ?? []).map((s) => ({
			name: String(s.name),
			value: String(s.name),
			description: `A ${String(s.status)} status`,
		}));
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as never, {
			message: "Couldn't read your lead statuses",
			description: 'The key needs View Leads.',
		});
	}
}

// The company's own fields (GET /api/v1/custom-fields) on what the node is working with. `appliesTo` holds the API's own
// path names — 'leads', 'customers', 'projects' (WebhookResourceTypes) — and N8nNodeTests holds the two used here to them.
async function customFields(
	this: ILoadOptionsFunctions,
	appliesTo: string,
): Promise<INodePropertyOptions[]> {
	try {
		const answer = await apiRequest.call(this, 'GET', '/api/v1/custom-fields');
		return ((answer.data as IDataObject[]) ?? [])
			.filter((f) => ((f.appliesTo as string[]) ?? []).includes(appliesTo))
			.map((f) => ({
				name: String(f.name),
				value: String(f.name),
				description: ((f.choices as string[]) ?? []).length
					? `One of: ${(f.choices as string[]).join(', ')}`
					: String(f.kind ?? ''),
			}));
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as never, {
			message: "Couldn't read your custom fields",
			description: `The key needs View ${appliesTo === 'leads' ? 'Leads' : 'Customers'}.`,
		});
	}
}

export async function getLeadFields(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	return await customFields.call(this, 'leads');
}

export async function getCustomerFields(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	return await customFields.call(this, 'customers');
}
