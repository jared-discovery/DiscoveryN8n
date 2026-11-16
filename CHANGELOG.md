# Changelog

## 0.1.3

- Released through npm's staged publishing: each version is staged by GitHub Actions, with its provenance, and goes
  live when a maintainer approves it.

## 0.1.2 (never on npm: its publish run was refused)

- The README has three example workflows: a call-back for every new lead, a website form that makes a lead, and a
  message to the team when an estimate is signed.

## 0.1.1

- The DiscoveryONE node: leads, customers and follow-ups (create, update, get, get many; complete a follow-up), and
  estimates, projects, invoices, payments, warranty requests and records of a company's own types (get, get many).
- The DiscoveryONE Trigger: starts a workflow on DiscoveryONE's events, through a webhook the key makes and deletes,
  with each delivery's signature checked.
- The DiscoveryONE API credential: the company's web address and an API key.
