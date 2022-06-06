import { GoogleCredentials } from '@/types';
import * as fs from 'fs/promises';
import { OAuth2Client } from 'google-auth-library';

const SCOPES = [
	'https://www.googleapis.com/auth/contacts.readonly',
	'https://www.googleapis.com/auth/contacts.other.readonly',
	'https://www.googleapis.com/auth/directory.readonly',
	'https://www.googleapis.com/auth/calendar.readonly',
	'https://www.googleapis.com/auth/calendar.events.readonly',
	'https://www.googleapis.com/auth/userinfo.profile'
];

export const getAuthClient = async (credentials: GoogleCredentials, tokenFile: string) => {
	let oAuth2Client: OAuth2Client | undefined;

	try {
		const { client_id, client_secret, redirect_uris } = credentials;
		oAuth2Client = new OAuth2Client(client_id, client_secret, redirect_uris);
	} catch (err) {
		console.warn(`Error loading client secret file: ${err}`);
		return;
	}

	try {
		const token = await fs.readFile(tokenFile);
		oAuth2Client.setCredentials(JSON.parse(token.toString()));
	} catch (err) {
		console.warn(`Token file not found for account: ${err}`);
	}
	return oAuth2Client;
};

export const getAuthURL = async (credentials: GoogleCredentials): Promise<string | undefined> => {
	try {
		const { client_id, client_secret, redirect_uris } = credentials;
		const oAuth2Client = new OAuth2Client(client_id, client_secret, redirect_uris);
		const authUrl = oAuth2Client.generateAuthUrl({
			access_type: 'offline',
			scope: SCOPES,
			//redirect_uri: 'urn:ietf:wg:oauth:2.0:oob'
			redirect_uri: redirect_uris
		});
		return authUrl;
	} catch (err: any) {
		console.error(`Error loading client secret file: ${err.message}`);
		return;
	}
};

export const writeTokenFile = async (credentials: GoogleCredentials, tokenFile: string, code: string) => {
	try {
		const { client_id, client_secret, redirect_uris } = credentials;
		const oAuth2Client = new OAuth2Client(client_id, client_secret, redirect_uris);
		const token = await oAuth2Client.getToken(code);
		await fs.writeFile(tokenFile, JSON.stringify(token.tokens));
		console.log('Token stored to', tokenFile);
	} catch (err: any) {
		console.error(`Error loading client secret file: ${err.message}`);
		return;
	}
};
