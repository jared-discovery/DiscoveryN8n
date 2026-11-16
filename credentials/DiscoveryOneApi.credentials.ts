import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

/*  A company's own DiscoveryONE: its web address and an API key made on Settings → API keys.
    Every company has its own address, so the address is part of the sign-in, and every request is built on it. */
export class DiscoveryOneApi implements ICredentialType {
	name = 'discoveryOneApi';

	displayName = 'DiscoveryONE API';

	icon: Icon = { light: 'file:../icons/discoveryone.svg', dark: 'file:../icons/discoveryone.dark.svg' };

	documentationUrl =
		'https://github.com/jared-discovery/DiscoveryN8n?tab=readme-ov-file#credentials';

	properties: INodeProperties[] = [
		{
			displayName: 'Web Address',
			name: 'baseUrl',
			type: 'string',
			required: true,
			default: '',
			placeholder: 'https://yourcompany.discoveryone.app',
			description:
				"The address you open DiscoveryONE at, starting with https://. It's in your browser's address bar.",
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			required: true,
			default: '',
			description:
				'A key made in DiscoveryONE under Settings → API keys. Tick what this workflow needs; for the trigger, also tick "Connect apps".',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl.replace(new RegExp("/+$"), "")}}',
			url: '/api/v1/key',
			method: 'GET',
		},
	};
}
