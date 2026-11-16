import type { INodeProperties } from 'n8n-workflow';
import { listPages } from '../shared/hooks';

export const warrantyRequestDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['warrantyRequest'],
			},
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				action: 'Get a warranty request',
				description: 'Get one warranty request by its ID',
				routing: {
					request: {
						method: 'GET',
						url: '=/api/v1/warranty-requests/{{$parameter.id}}',
					},
				},
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many warranty requests',
				description: 'Get many warranty requests, oldest change first',
				routing: {
					request: {
						method: 'GET',
						url: '/api/v1/warranty-requests',
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
		displayName: 'Warranty Request ID',
		name: 'id',
		type: 'number',
		required: true,
		default: 0,
		typeOptions: {
			minValue: 1,
		},
		displayOptions: {
			show: {
				resource: ['warrantyRequest'],
				operation: ['get'],
			},
		},
		description: "The warranty request's ID in DiscoveryONE",
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['warrantyRequest'],
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
				resource: ['warrantyRequest'],
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
				resource: ['warrantyRequest'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Project ID',
				name: 'projectId',
				type: 'number',
				default: 0,
				typeOptions: {
					minValue: 1,
				},
				description: 'Only the ones for this project',
				routing: {
					send: {
						type: 'query',
						property: 'projectId',
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
						name: 'Declined',
						value: 'Declined',
					},
					{
						name: 'New',
						value: 'New',
					},
					{
						name: 'Resolved',
						value: 'Resolved',
					},
					{
						name: 'Scheduled',
						value: 'Scheduled',
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
