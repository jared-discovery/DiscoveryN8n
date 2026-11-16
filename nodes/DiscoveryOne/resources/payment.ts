import type { INodeProperties } from 'n8n-workflow';
import { listPages } from '../shared/hooks';

export const paymentDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['payment'],
			},
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				action: 'Get a payment',
				description: 'Get one payment by its ID',
				routing: {
					request: {
						method: 'GET',
						url: '=/api/v1/payments/{{$parameter.id}}',
					},
				},
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many payments',
				description: 'Get many payments, oldest change first',
				routing: {
					request: {
						method: 'GET',
						url: '/api/v1/payments',
					},
					send: {
						paginate: true,
					},
					operations: {
						pagination: listPages,
					},
				},
			},
		],
		default: 'getAll',
	},
	{
		displayName: 'Payment ID',
		name: 'id',
		type: 'number',
		required: true,
		default: 0,
		typeOptions: {
			minValue: 1,
		},
		displayOptions: {
			show: {
				resource: ['payment'],
				operation: ['get'],
			},
		},
		description: "The payment's ID in DiscoveryONE",
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['payment'],
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
				resource: ['payment'],
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
				resource: ['payment'],
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
		],
	},
];
