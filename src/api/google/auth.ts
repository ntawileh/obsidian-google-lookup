import * as readline from 'readline';
import * as fs from 'fs/promises';
import { google, Common } from 'googleapis';

const SCOPES = [
	'https://www.googleapis.com/auth/contacts.readonly',
	'https://www.googleapis.com/auth/contacts.other.readonly',
	'https://www.googleapis.com/auth/directory.readonly',
	'https://www.googleapis.com/auth/calendar.readonly',
	'https://www.googleapis.com/auth/calendar.events.readonly'
];

type CallbackType = (auth: Common.OAuth2Client) => Promise<void>;

export const getAuthClient = async (credentialsFile: string, tokenFile: string) => {
	let oAuth2Client: Common.OAuth2Client | undefined;

	try {
		const content = await fs.readFile(credentialsFile);
		const {
			installed: { client_secret, client_id, redirect_uris }
		} = JSON.parse(content.toString());
		oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris);
	} catch (err) {
		console.warn(`Error loading client secret file: ${err}`);
		return;
	}

	try {
		const token = await fs.readFile(tokenFile);
		oAuth2Client.setCredentials(JSON.parse(token.toString()));
	} catch (err) {
		return; //await getNewToken(oAuth2Client, callback);
	}
	return oAuth2Client;
};

export const getAuthURL = async (credentialsFile: string): Promise<string | undefined> => {
	try {
		const content = await fs.readFile(credentialsFile);
		const {
			installed: { client_secret, client_id, redirect_uris }
		} = JSON.parse(content.toString());
		const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris);
		const authUrl = oAuth2Client.generateAuthUrl({
			access_type: 'offline',
			scope: SCOPES,
			//redirect_uri: 'urn:ietf:wg:oauth:2.0:oob'
			redirect_uri: 'http://127.0.0.1:14149'
		});
		return authUrl;
	} catch (err: any) {
		console.error(`Error loading client secret file: ${err.message}`);
		return;
	}
};

export const writeTokenFile = async (credentialsFile: string, tokenFile: string, code: string) => {
	try {
		const content = await fs.readFile(credentialsFile);
		const {
			installed: { client_secret, client_id, redirect_uris }
		} = JSON.parse(content.toString());
		const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris);
		oAuth2Client.getToken(code, async (err, token) => {
			if (err || !token) return console.error('Error retrieving access token', err);
			oAuth2Client.setCredentials(token);
			await fs.writeFile(tokenFile, JSON.stringify(token));
			console.log('Token stored to', tokenFile);
		});
	} catch (err: any) {
		console.error(`Error loading client secret file: ${err.message}`);
		return;
	}
};
