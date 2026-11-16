# n8n-nodes-discoveryone

This is an n8n community node. It lets you use [DiscoveryONE](https://discoveryone.app), the construction-management
platform, in your n8n workflows: start a workflow when something happens in DiscoveryONE, and read and write its
leads, customers, follow-ups and more.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/sustainable-use-license/) workflow automation
platform.

- [Installation](#installation)
- [Credentials](#credentials)
- [Operations](#operations)
- [Trigger](#trigger)
- [Compatibility](#compatibility)
- [Usage](#usage)
- [Resources](#resources)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community
nodes documentation, and install `n8n-nodes-discoveryone`.

## Credentials

You need two things from your company's DiscoveryONE:

1. **Its web address** — the address you open DiscoveryONE at, starting with `https://`.
2. **An API key.** In DiscoveryONE, open **Settings → API keys** and make a key for n8n (you need *Manage Settings*).
   Tick only what your workflows need:
   - the **View** ticks for what they read (View Leads, View Customers, …);
   - **What it may change** for the leads, customers and follow-ups they add or change;
   - **Connect apps** if you use the **DiscoveryONE Trigger**, which makes its own webhook.

   The key is shown once. In n8n, add a **DiscoveryONE API** credential with the web address and the key.

A key never does more than the person who made it may do. Revoking it on **Settings → API keys** stops every workflow
using it at its next call, and deletes the webhooks it made.

## Operations

| Resource | Operations |
|---|---|
| Lead | Create, Get, Get Many, Update |
| Customer | Create, Get, Get Many, Update |
| Follow-Up | Create, Complete, Get, Get Many |
| Estimate, Project, Invoice, Payment, Warranty Request | Get, Get Many |
| Record (your company's own record types) | Get, Get Many |

- **Get Many** returns records **oldest change first**, so a workflow that keeps the last one it saw can pick up where
  it left off. Each resource has the filters DiscoveryONE's API takes (a lead's status, a project's stage, an invoice's
  status, …).
- **Create** sends an `Idempotency-Key`, so n8n's *Retry On Fail* never makes a second lead, customer or follow-up.
- A lead's **Status Name** and each **Custom Field** are offered from your company's own lists.
- Lead's answers can be **Simplified** to the fields most workflows use.
- What a key may see decides what comes back: a phone number or a price the key may not see stays hidden.
- The node can be used as a tool by n8n's AI agents.

## Trigger

**DiscoveryONE Trigger** starts a workflow on the events you choose — a lead created, a lead's status changed, an
estimate sent, signed, won or lost, an invoice issued or paid, a payment received or reversed, a project created or
moved to another stage, a warranty request, a follow-up completed, a customer created, and a record of your own types
added or changed.

- Turning the workflow on makes a webhook in DiscoveryONE that **belongs to the key**; turning it off deletes it. It
  is listed on DiscoveryONE's **Settings → Webhooks** as made by that key.
- Every delivery's signature (`X-DiscoveryOne-Signature`) is checked with the webhook's own secret; one that doesn't
  match, or is more than five minutes old, is refused.
- An event carries only its type, its record's ID and a link. With **Fetch the Record** on (the default), the trigger
  reads the record with the key and adds it as `record` — and it sends the key only to a link on your own DiscoveryONE
  address.
- A key hears only events about records it may read.
- DiscoveryONE sends events only to `https://` addresses, so n8n needs a public https address (n8n Cloud has one; a
  self-hosted n8n sets `WEBHOOK_URL`).

## Compatibility

Built with `@n8n/node-cli` 0.56 against n8n 2.x (`n8nNodesApiVersion` 1). Uses DiscoveryONE's API version 1
(`/api/v1`).

## Usage

The API this node calls is described at `https://<your address>/api/v1/openapi.json`. AI agents can also reach
DiscoveryONE directly over MCP at `https://<your address>/mcp`; that needs no n8n.

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
- [Changelog](CHANGELOG.md)
