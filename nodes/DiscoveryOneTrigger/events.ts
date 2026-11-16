import type { INodePropertyOptions } from 'n8n-workflow';

/*  What the trigger can listen for: the events a key may subscribe to (DiscoveryONE's WebhookEventTypes.Offered).
    N8nNodeTests holds every value here to that list. A key hears only events about records it may read. */
export const EVENTS: INodePropertyOptions[] = [
	{ name: 'Customer Created', value: 'customer.created', description: 'A customer was added' },
	{ name: 'Estimate Lost', value: 'estimate.lost' },
	{ name: 'Estimate Sent', value: 'estimate.sent' },
	{ name: 'Estimate Signed', value: 'estimate.signed' },
	{ name: 'Estimate Won', value: 'estimate.won' },
	{ name: 'Follow-Up Completed', value: 'followup.completed' },
	{ name: 'Invoice Issued', value: 'invoice.issued' },
	{ name: 'Invoice Paid', value: 'invoice.paid' },
	{ name: 'Lead Created', value: 'lead.created', description: 'A lead came in, from any source' },
	{ name: 'Lead Status Changed', value: 'lead.status_changed' },
	{ name: 'Payment Received', value: 'payment.received' },
	{ name: 'Payment Reversed', value: 'payment.reversed' },
	{ name: 'Project Created', value: 'project.created' },
	{ name: 'Project Stage Changed', value: 'project.stage_changed' },
	{
		name: 'Record Changed',
		value: 'record.changed',
		description: "A record of one of your company's own types was changed",
	},
	{
		name: 'Record Created',
		value: 'record.created',
		description: "A record of one of your company's own types was added",
	},
	{ name: 'Warranty Requested', value: 'warranty.requested' },
];
