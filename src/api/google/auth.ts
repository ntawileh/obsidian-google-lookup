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

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
const getNewToken = async (oAuth2Client: Common.OAuth2Client, callback: CallbackType) => {
	const TOKEN_PATH = '/Users/nadimtawileh/tmp/token.json';
	const authUrl = oAuth2Client.generateAuthUrl({
		access_type: 'offline',
		scope: SCOPES
	});
	console.log('Authorize this app by visiting this url:', authUrl);
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});
	rl.question('Enter the code from that page here: ', (code) => {
		rl.close();
		oAuth2Client.getToken(code, async (err, token) => {
			if (err || !token) return console.error('Error retrieving access token', err);
			oAuth2Client.setCredentials(token);
			// Store the token to disk for later program executions
			await fs.writeFile(TOKEN_PATH, JSON.stringify(token));
			console.log('Token stored to', TOKEN_PATH);
			await callback(oAuth2Client);
		});
	});
};
