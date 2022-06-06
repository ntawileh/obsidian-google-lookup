import GoogleLookupPlugin from '@/main';
import { GoogleCredentials } from '@/types';

export const getGoogleCredentials = (plugin: GoogleLookupPlugin): GoogleCredentials => {
	const { client_id, client_redirect_uri_port, client_secret } = plugin.settings!;
	return {
		client_id,
		client_secret,
		redirect_uris: `http://127.0.0.1:${client_redirect_uri_port}`,
		redirect_port: parseInt(client_redirect_uri_port)
	};
};
