import type { INodeProperties } from 'n8n-workflow';
import { customFieldsBody, idempotencyKey, listPages } from '../shared/hooks';

// Customers: added, changed, read.
export const customerDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['customer'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create a customer',
				description: 'Create a new customer',
				routing: {
					request: {
						method: 'POST',
						url: '/api/v1/customers',
					},
					send: {
						preSend: [idempotencyKey, customFieldsBody],
					},
				},
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get a customer',
				description: 'Get one customer by its ID',
				routing: {
					request: {
						method: 'GET',
						url: '=/api/v1/customers/{{$parameter.id}}',
					},
				},
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many customers',
				description: 'Get many customers, oldest change first',
				routing: {
					request: {
						method: 'GET',
						url: '/api/v1/customers',
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
				action: 'Update a customer',
				description: 'Change the fields you set on a customer; the rest stay as they are',
				routing: {
					request: {
						method: 'PATCH',
						url: '=/api/v1/customers/{{$parameter.id}}',
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
		displayName: 'Customer ID',
		name: 'id',
		type: 'number',
		required: true,
		default: 0,
		typeOptions: {
			minValue: 1,
		},
		displayOptions: {
			show: {
				resource: ['customer'],
				operation: ['get', 'update'],
			},
		},
		description: "The customer's ID in DiscoveryONE",
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		default: '',
		description: "The customer's name",
		routing: {
			send: {
				type: 'body',
				property: 'name',
			},
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['customer'],
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
				resource: ['customer'],
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
									loadOptionsMethod: 'getCustomerFields',
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
				displayName: 'Tags',
				name: 'tags',
				type: 'string',
				default: '',
				description: 'Separated by commas. Replaces the tags the customer has.',
				routing: {
					send: {
						type: 'body',
						property: 'tags',
						value: '={{ String($value).split(",").map((t) => t.trim()).filter((t) => t) }}',
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
				resource: ['customer'],
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
									loadOptionsMethod: 'getCustomerFields',
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
				displayName: 'Tags',
				name: 'tags',
				type: 'string',
				default: '',
				description: 'Separated by commas. Replaces the tags the customer has.',
				routing: {
					send: {
						type: 'body',
						property: 'tags',
						value: '={{ String($value).split(",").map((t) => t.trim()).filter((t) => t) }}',
					},
				},
			},
		],
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['customer'],
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
				resource: ['customer'],
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
				resource: ['customer'],
				operation: ['getAll'],
			},
		},
		options: [
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
				default: 'Prospect',
				options: [
					{
						name: 'Active',
						value: 'Active',
					},
					{
						name: 'Archived',
						value: 'Archived',
					},
					{
						name: 'Past',
						value: 'Past',
					},
					{
						name: 'Prospect',
						value: 'Prospect',
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
