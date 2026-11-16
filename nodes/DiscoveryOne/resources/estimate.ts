import type { INodeProperties } from 'n8n-workflow';
import { listPages } from '../shared/hooks';

export const estimateDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['estimate'],
			},
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				action: 'Get a estimate',
				description: 'Get one estimate by its ID',
				routing: {
					request: {
						method: 'GET',
						url: '=/api/v1/estimates/{{$parameter.id}}',
					},
				},
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many estimates',
				description: 'Get many estimates, oldest change first',
				routing: {
					request: {
						method: 'GET',
						url: '/api/v1/estimates',
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
		displayName: 'Estimate ID',
		name: 'id',
		type: 'number',
		required: true,
		default: 0,
		typeOptions: {
			minValue: 1,
		},
		displayOptions: {
			show: {
				resource: ['estimate'],
				operation: ['get'],
			},
		},
		description: "The estimate's ID in DiscoveryONE",
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['estimate'],
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
				resource: ['estimate'],
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
				resource: ['estimate'],
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
				displayName: 'Lead ID',
				name: 'leadId',
				type: 'number',
				default: 0,
				typeOptions: {
					minValue: 1,
				},
				description: 'Only the ones for this lead',
				routing: {
					send: {
						type: 'query',
						property: 'leadId',
					},
				},
			},
			{
				displayName: 'Outcome',
				name: 'outcome',
				type: 'options',
				default: 'Undecided',
				options: [
					{
						name: 'Lost',
						value: 'Lost',
					},
					{
						name: 'Undecided',
						value: 'Undecided',
					},
					{
						name: 'Won',
						value: 'Won',
					},
				],
				description: 'Only the ones with this outcome',
				routing: {
					send: {
						type: 'query',
						property: 'outcome',
					},
				},
			},
		],
	},
];
