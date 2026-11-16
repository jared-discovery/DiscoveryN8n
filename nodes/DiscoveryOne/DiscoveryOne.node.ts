import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';
import { customerDescription } from './resources/customer';
import { followUpDescription } from './resources/followUp';
import { leadDescription } from './resources/lead';
import { estimateDescription } from './resources/estimate';
import { invoiceDescription } from './resources/invoice';
import { paymentDescription } from './resources/payment';
import { projectDescription } from './resources/project';
import { recordDescription } from './resources/record';
import { warrantyRequestDescription } from './resources/warrantyRequest';
import { getCustomerFields, getLeadFields, getLeadStatuses } from './shared/choices';
import { apiErrors } from './shared/hooks';

/*  DiscoveryONE's records through its API (/api/v1): read them, and add and change leads, customers and follow-ups.
    Declarative: each operation is a request the API describes; the key's own ticks decide what answers. */
export class DiscoveryOne implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'DiscoveryONE',
		name: 'discoveryOne',
		icon: {
			light: 'file:../../icons/discoveryone.svg',
			dark: 'file:../../icons/discoveryone.dark.svg',
		},
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Read and write leads, customers, follow-ups and more in DiscoveryONE',
		defaults: { name: 'DiscoveryONE' },
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'discoveryOneApi', required: true }],
		requestDefaults: {
			baseURL: '={{$credentials.baseUrl.replace(new RegExp("/+$"), "")}}',
			headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
			// Every answer reaches apiErrors (each resource's first postReceive), which says what went wrong in words.
			ignoreHttpStatusErrors: true,
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Customer',
						value: 'customer',
						routing: { output: { postReceive: [apiErrors] } },
					},
					{
						name: 'Estimate',
						value: 'estimate',
						routing: { output: { postReceive: [apiErrors] } },
					},
					{
						name: 'Follow-Up',
						value: 'followUp',
						routing: { output: { postReceive: [apiErrors] } },
					},
					{ name: 'Invoice', value: 'invoice', routing: { output: { postReceive: [apiErrors] } } },
					{ name: 'Lead', value: 'lead', routing: { output: { postReceive: [apiErrors] } } },
					{ name: 'Payment', value: 'payment', routing: { output: { postReceive: [apiErrors] } } },
					{ name: 'Project', value: 'project', routing: { output: { postReceive: [apiErrors] } } },
					{
						name: 'Record',
						value: 'record',
						description: "A record of one of your company's own types",
						routing: { output: { postReceive: [apiErrors] } },
					},
					{
						name: 'Warranty Request',
						value: 'warrantyRequest',
						routing: { output: { postReceive: [apiErrors] } },
					},
				],
				default: 'lead',
			},
			...customerDescription,
			...estimateDescription,
			...followUpDescription,
			...invoiceDescription,
			...leadDescription,
			...paymentDescription,
			...projectDescription,
			...recordDescription,
			...warrantyRequestDescription,
		],
	};

	methods = {
		loadOptions: {
			getCustomerFields,
			getLeadFields,
			getLeadStatuses,
		},
	};
}
