import type { INodeProperties } from 'n8n-workflow';
import { listPages } from '../shared/hooks';

export const projectDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['project'],
			},
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				action: 'Get a project',
				description: 'Get one project by its ID',
				routing: {
					request: {
						method: 'GET',
						url: '=/api/v1/projects/{{$parameter.id}}',
					},
				},
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many projects',
				description: 'Get many projects, oldest change first',
				routing: {
					request: {
						method: 'GET',
						url: '/api/v1/projects',
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
		displayName: 'Project ID',
		name: 'id',
		type: 'number',
		required: true,
		default: 0,
		typeOptions: {
			minValue: 1,
		},
		displayOptions: {
			show: {
				resource: ['project'],
				operation: ['get'],
			},
		},
		description: "The project's ID in DiscoveryONE",
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['project'],
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
				resource: ['project'],
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
				resource: ['project'],
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
				displayName: 'Stage',
				name: 'stage',
				type: 'options',
				default: 'Lead',
				options: [
					{
						name: 'Approved',
						value: 'Approved',
					},
					{
						name: 'Archived',
						value: 'Archived',
					},
					{
						name: 'Estimate',
						value: 'Estimate',
					},
					{
						name: 'In Progress',
						value: 'InProgress',
					},
					{
						name: 'Lead',
						value: 'Lead',
					},
					{
						name: 'Materials',
						value: 'Materials',
					},
					{
						name: 'Paid',
						value: 'Paid',
					},
					{
						name: 'Scheduled',
						value: 'Scheduled',
					},
					{
						name: 'Walkthrough',
						value: 'Walkthrough',
					},
				],
				description: 'Only the ones with this stage',
				routing: {
					send: {
						type: 'query',
						property: 'stage',
					},
				},
			},
		],
	},
];
