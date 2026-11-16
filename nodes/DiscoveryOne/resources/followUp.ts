import type { INodeProperties } from 'n8n-workflow';
import { idempotencyKey, listPages } from '../shared/hooks';

// Follow-ups: added on a lead, customer, estimate or project, marked done, read.
export const followUpDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['followUp'],
			},
		},
		options: [
			{
				name: 'Complete',
				value: 'complete',
				action: 'Complete a follow up',
				description: 'Mark a follow-up done',
				routing: {
					request: {
						method: 'POST',
						url: '=/api/v1/followups/{{$parameter.id}}/complete',
					},
				},
			},
			{
				name: 'Create',
				value: 'create',
				action: 'Create a follow up',
				description: 'Create a new follow-up',
				routing: {
					request: {
						method: 'POST',
						url: '/api/v1/followups',
					},
					send: {
						preSend: [idempotencyKey],
					},
				},
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get a follow up',
				description: 'Get one follow-up by its ID',
				routing: {
					request: {
						method: 'GET',
						url: '=/api/v1/followups/{{$parameter.id}}',
					},
				},
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many follow ups',
				description: 'Get many follow-ups, oldest change first',
				routing: {
					request: {
						method: 'GET',
						url: '/api/v1/followups',
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
		default: 'create',
	},
	{
		displayName: 'Follow-Up ID',
		name: 'id',
		type: 'number',
		required: true,
		default: 0,
		typeOptions: {
			minValue: 1,
		},
		displayOptions: {
			show: {
				resource: ['followUp'],
				operation: ['complete', 'get'],
			},
		},
		description: "The follow-up's ID in DiscoveryONE",
	},
	{
		displayName: 'Related To',
		name: 'relatedType',
		type: 'options',
		default: 'lead',
		options: [
			{
				name: 'Customer',
				value: 'customer',
			},
			{
				name: 'Estimate',
				value: 'estimate',
			},
			{
				name: 'Lead',
				value: 'lead',
			},
			{
				name: 'Project',
				value: 'project',
			},
		],
		description: 'What the follow-up is about',
		routing: {
			send: {
				type: 'body',
				property: 'relatedType',
			},
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['followUp'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Related ID',
		name: 'relatedId',
		type: 'number',
		default: 0,
		typeOptions: {
			minValue: 1,
		},
		description: 'The ID of the lead, customer, estimate or project',
		routing: {
			send: {
				type: 'body',
				property: 'relatedId',
			},
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['followUp'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Title',
		name: 'title',
		type: 'string',
		default: '',
		routing: {
			send: {
				type: 'body',
				property: 'title',
			},
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['followUp'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Due Date',
		name: 'dueDate',
		type: 'dateTime',
		default: '',
		description: 'The day it is due',
		routing: {
			send: {
				type: 'body',
				property: 'dueDate',
				value: '={{ $value ? String($value).slice(0, 10) : null }}',
			},
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['followUp'],
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
				resource: ['followUp'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Assigned To',
				name: 'assignedTo',
				type: 'string',
				default: '',
				description: 'The name of the person it is for',
				routing: {
					send: {
						type: 'body',
						property: 'assignedTo',
					},
				},
			},
			{
				displayName: 'Kind',
				name: 'kind',
				type: 'options',
				default: 'call',
				options: [
					{
						name: 'Call',
						value: 'call',
					},
					{
						name: 'Email',
						value: 'email',
					},
					{
						name: 'Meeting',
						value: 'meeting',
					},
					{
						name: 'Text (SMS)',
						value: 'sms',
					},
					{
						name: 'To-Do',
						value: 'todo',
					},
					{
						name: 'Visit',
						value: 'visit',
					},
				],
				routing: {
					send: {
						type: 'body',
						property: 'kind',
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
		],
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['followUp'],
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
				resource: ['followUp'],
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
				resource: ['followUp'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Open Only',
				name: 'open',
				type: 'boolean',
				default: true,
				description:
					'Whether to return only the ones not yet done (on) or only the done ones (off)',
				routing: {
					send: {
						type: 'query',
						property: 'open',
					},
				},
			},
			{
				displayName: 'Related ID',
				name: 'relatedId',
				type: 'number',
				default: 0,
				typeOptions: {
					minValue: 1,
				},
				description: 'Only the ones about this record. Set Related To as well.',
				routing: {
					send: {
						type: 'query',
						property: 'relatedId',
					},
				},
			},
			{
				displayName: 'Related To',
				name: 'relatedType',
				type: 'options',
				default: 'lead',
				options: [
					{
						name: 'Customer',
						value: 'customer',
					},
					{
						name: 'Estimate',
						value: 'estimate',
					},
					{
						name: 'Lead',
						value: 'lead',
					},
					{
						name: 'Project',
						value: 'project',
					},
				],
				description: 'Only the ones about this kind of record. Set Related ID as well.',
				routing: {
					send: {
						type: 'query',
						property: 'relatedType',
					},
				},
			},
		],
	},
];
