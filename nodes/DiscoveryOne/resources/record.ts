import type { INodeProperties } from 'n8n-workflow';
import { listPages } from '../shared/hooks';

export const recordDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['record'],
			},
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				action: 'Get a record',
				description: 'Get one record by its ID',
				routing: {
					request: {
						method: 'GET',
						url: '=/api/v1/records/{{$parameter.id}}',
					},
				},
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many records',
				description: 'Get many records, oldest change first',
				routing: {
					request: {
						method: 'GET',
						url: '/api/v1/records',
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
		displayName: 'Record ID',
		name: 'id',
		type: 'number',
		required: true,
		default: 0,
		typeOptions: {
			minValue: 1,
		},
		displayOptions: {
			show: {
				resource: ['record'],
				operation: ['get'],
			},
		},
		description: "The record's ID in DiscoveryONE",
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['record'],
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
				resource: ['record'],
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
				resource: ['record'],
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
				displayName: 'Record Type ID',
				name: 'typeId',
				type: 'number',
				default: 0,
				typeOptions: {
					minValue: 1,
				},
				description: 'Only the ones for this record type',
				routing: {
					send: {
						type: 'query',
						property: 'typeId',
					},
				},
			},
		],
	},
];
