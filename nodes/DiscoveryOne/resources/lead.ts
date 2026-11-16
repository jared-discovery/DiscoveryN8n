import type { INodeProperties } from 'n8n-workflow';
import { customFieldsBody, idempotencyKey, listPages, simplifyOne } from '../shared/hooks';

// Leads: added, changed, read. Every path is one /api/v1/openapi.json describes (N8nNodeTests holds them).
export const leadDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['lead'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create a lead',
				description: 'Create a new lead',
				routing: {
					request: {
						method: 'POST',
						url: '/api/v1/leads',
					},
					send: {
						preSend: [idempotencyKey, customFieldsBody],
					},
				},
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get a lead',
				description: 'Get one lead by its ID',
				routing: {
					request: {
						method: 'GET',
						url: '=/api/v1/leads/{{$parameter.id}}',
					},
				},
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many leads',
				description: 'Get many leads, oldest change first',
				routing: {
					request: {
						method: 'GET',
						url: '/api/v1/leads',
					},
					send: {
						paginate: true,
					},
					operations: {
						pagination: listPages,
					},
				},
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update a lead',
				description: 'Change the fields you set on a lead; the rest stay as they are',
				routing: {
					request: {
						method: 'PATCH',
						url: '=/api/v1/leads/{{$parameter.id}}',
					},
					send: {
						preSend: [customFieldsBody],
					},
				},
			},
		],
		default: 'create',
	},
	{
		displayName: 'Lead ID',
		name: 'id',
		type: 'number',
		required: true,
		default: 0,
		typeOptions: {
			minValue: 1,
		},
		displayOptions: {
			show: {
				resource: ['lead'],
				operation: ['get', 'update'],
			},
		},
		description: "The lead's ID in DiscoveryONE",
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		default: '',
		description: "The lead's name",
		routing: {
			send: {
				type: 'body',
				property: 'name',
			},
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['lead'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['lead'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Address',
				name: 'address',
				type: 'string',
				default: '',
				routing: {
					send: {
						type: 'body',
						property: 'address',
					},
				},
			},
			{
				displayName: 'Attachments URL',
				name: 'attachmentsUrl',
				type: 'string',
				default: '',
				routing: {
					send: {
						type: 'body',
						property: 'attachmentsUrl',
					},
				},
			},
			{
				displayName: 'Budget',
				name: 'budget',
				type: 'string',
				default: '',
				routing: {
					send: {
						type: 'body',
						property: 'budget',
					},
				},
			},
			{
				displayName: 'Company',
				name: 'company',
				type: 'string',
				default: '',
				routing: {
					send: {
						type: 'body',
						property: 'company',
					},
				},
			},
			{
				displayName: 'Custom Fields',
				name: 'customFields',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				placeholder: 'Add Custom Field',
				default: {},
				options: [
					{
						displayName: 'Field',
						name: 'field',
						values: [
							{
								displayName: 'Field Name or ID',
								name: 'name',
								type: 'options',
								typeOptions: {
									loadOptionsMethod: 'getLeadFields',
								},
								default: '',
								description:
									'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'The answer, as text. Leave it empty to clear the field.',
							},
						],
					},
				],
			},
			{
				displayName: 'Customer ID',
				name: 'customerId',
				type: 'number',
				default: 0,
				typeOptions: {
					minValue: 1,
				},
				description: 'The customer this lead belongs to',
				routing: {
					send: {
						type: 'body',
						property: 'customerId',
					},
				},
			},
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				default: '',
				placeholder: 'name@email.com',
				routing: {
					send: {
						type: 'body',
						property: 'email',
					},
				},
			},
			{
				displayName: 'Estimated Value',
				name: 'estimatedValue',
				type: 'number',
				default: 0,
				typeOptions: {
					minValue: 0,
					numberPrecision: 2,
				},
				description: 'Needs a key that may also view job prices',
				routing: {
					send: {
						type: 'body',
						property: 'estimatedValue',
					},
				},
			},
			{
				displayName: 'Next Follow-Up',
				name: 'nextFollowUp',
				type: 'dateTime',
				default: '',
				description: 'When to follow up next',
				routing: {
					send: {
						type: 'body',
						property: 'nextFollowUp',
						value: '={{ $value ? String($value).slice(0, 10) : null }}',
					},
				},
			},
			{
				displayName: 'Notes',
				name: 'notes',
				type: 'string',
				default: '',
				typeOptions: {
					rows: 4,
				},
				routing: {
					send: {
						type: 'body',
						property: 'notes',
					},
				},
			},
			{
				displayName: 'Phone',
				name: 'phone',
				type: 'string',
				default: '',
				routing: {
					send: {
						type: 'body',
						property: 'phone',
					},
				},
			},
			{
				displayName: 'Project Type',
				name: 'projectType',
				type: 'string',
				default: '',
				routing: {
					send: {
						type: 'body',
						property: 'projectType',
					},
				},
			},
			{
				displayName: 'SMS Consent',
				name: 'smsConsent',
				type: 'boolean',
				default: false,
				description: 'Whether the person agreed to receive texts',
				routing: {
					send: {
						type: 'body',
						property: 'smsConsent',
					},
				},
			},
			{
				displayName: 'SMS Consent Text',
				name: 'smsConsentText',
				type: 'string',
				default: '',
				description: 'The words they agreed to',
				routing: {
					send: {
						type: 'body',
						property: 'smsConsentText',
					},
				},
			},
			{
				displayName: 'Source',
				name: 'source',
				type: 'string',
				default: '',
				description: 'Where the lead came from',
				routing: {
					send: {
						type: 'body',
						property: 'source',
					},
				},
			},
			{
				displayName: 'Source Page',
				name: 'sourcePage',
				type: 'string',
				default: '',
				description: 'The page the lead came in on',
				routing: {
					send: {
						type: 'body',
						property: 'sourcePage',
					},
				},
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				default: 'New',
				options: [
					{
						name: 'Contacted',
						value: 'Contacted',
					},
					{
						name: 'Converted',
						value: 'Converted',
					},
					{
						name: 'Lost',
						value: 'Lost',
					},
					{
						name: 'New',
						value: 'New',
					},
					{
						name: 'Qualified',
						value: 'Qualified',
					},
				],
				description:
					'The kind of status. To use one of your own named statuses, set Status Name instead.',
				routing: {
					send: {
						type: 'body',
						property: 'status',
					},
				},
			},
			{
				displayName: 'Status Name or ID',
				name: 'statusName',
				type: 'options',
				default: '',
				typeOptions: {
					loadOptionsMethod: 'getLeadStatuses',
				},
				description:
					'One of your own lead statuses. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
				routing: {
					send: {
						type: 'body',
						property: 'statusName',
					},
				},
			},
			{
				displayName: 'Timing',
				name: 'timing',
				type: 'string',
				default: '',
				routing: {
					send: {
						type: 'body',
						property: 'timing',
					},
				},
			},
		],
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['lead'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Address',
				name: 'address',
				type: 'string',
				default: '',
				routing: {
					send: {
						type: 'body',
						property: 'address',
					},
				},
			},
			{
				displayName: 'Company',
				name: 'company',
				type: 'string',
				default: '',
				routing: {
					send: {
						type: 'body',
						property: 'company',
					},
				},
			},
			{
				displayName: 'Custom Fields',
				name: 'customFields',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				placeholder: 'Add Custom Field',
				default: {},
				options: [
					{
						displayName: 'Field',
						name: 'field',
						values: [
							{
								displayName: 'Field Name or ID',
								name: 'name',
								type: 'options',
								typeOptions: {
									loadOptionsMethod: 'getLeadFields',
								},
								default: '',
								description:
									'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'The answer, as text. Leave it empty to clear the field.',
							},
						],
					},
				],
			},
			{
				displayName: 'Customer ID',
				name: 'customerId',
				type: 'number',
				default: 0,
				typeOptions: {
					minValue: 1,
				},
				description: 'The customer this lead belongs to',
				routing: {
					send: {
						type: 'body',
						property: 'customerId',
					},
				},
			},
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				default: '',
				placeholder: 'name@email.com',
				routing: {
					send: {
						type: 'body',
						property: 'email',
					},
				},
			},
			{
				displayName: 'Estimated Value',
				name: 'estimatedValue',
				type: 'number',
				default: 0,
				typeOptions: {
					minValue: 0,
					numberPrecision: 2,
				},
				description: 'Needs a key that may also view job prices',
				routing: {
					send: {
						type: 'body',
						property: 'estimatedValue',
					},
				},
			},
			{
				displayName: 'Lost Reason',
				name: 'lostReason',
				type: 'string',
				default: '',
				description: 'Why the lead was lost',
				routing: {
					send: {
						type: 'body',
						property: 'lostReason',
					},
				},
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				routing: {
					send: {
						type: 'body',
						property: 'name',
					},
				},
			},
			{
				displayName: 'Next Follow-Up',
				name: 'nextFollowUp',
				type: 'dateTime',
				default: '',
				description: 'When to follow up next',
				routing: {
					send: {
						type: 'body',
						property: 'nextFollowUp',
						value: '={{ $value ? String($value).slice(0, 10) : null }}',
					},
				},
			},
			{
				displayName: 'Notes',
				name: 'notes',
				type: 'string',
				default: '',
				typeOptions: {
					rows: 4,
				},
				routing: {
					send: {
						type: 'body',
						property: 'notes',
					},
				},
			},
			{
				displayName: 'Phone',
				name: 'phone',
				type: 'string',
				default: '',
				routing: {
					send: {
						type: 'body',
						property: 'phone',
					},
				},
			},
			{
				displayName: 'Source',
				name: 'source',
				type: 'string',
				default: '',
				description: 'Where the lead came from',
				routing: {
					send: {
						type: 'body',
						property: 'source',
					},
				},
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				default: 'New',
				options: [
					{
						name: 'Contacted',
						value: 'Contacted',
					},
					{
						name: 'Converted',
						value: 'Converted',
					},
					{
						name: 'Lost',
						value: 'Lost',
					},
					{
						name: 'New',
						value: 'New',
					},
					{
						name: 'Qualified',
						value: 'Qualified',
					},
				],
				description:
					'The kind of status. To use one of your own named statuses, set Status Name instead.',
				routing: {
					send: {
						type: 'body',
						property: 'status',
					},
				},
			},
			{
				displayName: 'Status Name or ID',
				name: 'statusName',
				type: 'options',
				default: '',
				typeOptions: {
					loadOptionsMethod: 'getLeadStatuses',
				},
				description:
					'One of your own lead statuses. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
				routing: {
					send: {
						type: 'body',
						property: 'statusName',
					},
				},
			},
		],
	},
	{
		displayName: 'Simplify',
		name: 'simplify',
		type: 'boolean',
		default: true,
		displayOptions: {
			show: {
				resource: ['lead'],
				operation: ['get', 'getAll'],
			},
		},
		description: 'Whether to return a simplified version of the response instead of the raw data',
		routing: {
			output: {
				postReceive: [simplifyOne],
			},
		},
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['lead'],
				operation: ['getAll'],
			},
		},
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 50,
		typeOptions: {
			minValue: 1,
		},
		displayOptions: {
			show: {
				resource: ['lead'],
				operation: ['getAll'],
				returnAll: [false],
			},
		},
		description: 'Max number of results to return',
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['lead'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Customer ID',
				name: 'customerId',
				type: 'number',
				default: 0,
				typeOptions: {
					minValue: 1,
				},
				description: 'Only the ones for this customer',
				routing: {
					send: {
						type: 'query',
						property: 'customerId',
					},
				},
			},
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				default: '',
				placeholder: 'name@email.com',
				routing: {
					send: {
						type: 'query',
						property: 'email',
					},
				},
			},
			{
				displayName: 'Phone',
				name: 'phone',
				type: 'string',
				default: '',
				routing: {
					send: {
						type: 'query',
						property: 'phone',
					},
				},
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				default: 'New',
				options: [
					{
						name: 'Contacted',
						value: 'Contacted',
					},
					{
						name: 'Converted',
						value: 'Converted',
					},
					{
						name: 'Lost',
						value: 'Lost',
					},
					{
						name: 'New',
						value: 'New',
					},
					{
						name: 'Qualified',
						value: 'Qualified',
					},
				],
				description: 'Only the ones with this status',
				routing: {
					send: {
						type: 'query',
						property: 'status',
					},
				},
			},
		],
	},
];
