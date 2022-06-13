import GoogleLookupPlugin from '@/main';
import { GoogleCredentials } from '@/types';

export const getGoogleCredentials = (plugin: GoogleLookupPlugin): GoogleCredentials => {
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const { client_id, client_redirect_uri_port, client_secret } = plugin.settings!;
	return {
		client_id,
		client_secret,
		redirect_uris: `http://127.0.0.1:${client_redirect_uri_port}`,
		redirect_port: parseInt(client_redirect_uri_port)
	};
};

export const hasGoogleCredentials = (plugin: GoogleLookupPlugin): boolean => {
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const { client_id, client_redirect_uri_port, client_secret } = plugin.settings!;

	return client_id.length > 0 && client_secret.length > 0 && client_redirect_uri_port.length > 0;
};
