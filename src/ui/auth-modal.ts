import http from 'http';
import { getAuthURL, writeTokenFile } from '@/api/google/auth';
import { GoogleAccount } from '@/models/Account';
import { App, Modal, Notice, Setting } from 'obsidian';
import { getAuthenticatedUserEmail, getPeopleService } from '@/api/google/people-search';

export class AuthModal extends Modal {
	result: string | undefined;
	#account: GoogleAccount;
	#server: http.Server | undefined;
	onSubmit: (result: string) => void;

	constructor(app: App, account: GoogleAccount, onSubmit: (result: string) => void) {
		super(app);
		this.#account = account;
		this.onSubmit = onSubmit;
	}

	async onOpen() {
		const { contentEl } = this;

		const url = await getAuthURL(GoogleAccount.credentials);
		this.#server = http
			.createServer(async (req, res) => {
				const re = /\/\?code=(\d\/[\w|-]*)&/;
				if (req.url) {
					const match = req.url.match(re);
					if (match && match?.length > 1) {
						this.onSubmit(match[1]);
						setTimeout(() => {
							this.close();
						}, 800);
						res.statusCode = 200;
						return res.end('OK - You can close this tab and go back to Obsidian!');
					}
				}

				res.statusCode = 404;
				return res.end('Not found');
			})
			.listen(GoogleAccount.credentials.redirect_port);

		contentEl.createEl('h3', {
			text: `login to Google account ${this.#account.accountName === 'NEW_ACCOUNT' ? '' : this.#account.accountName}`
		});
		contentEl.createEl('a', { text: `click here to authenticate`, href: url });

		contentEl.createEl('p', {
			text: 'This popup will close automatically if you are successfully authenticated.  Click on the link above and follow instructions to log in.'
		});
	}

	onClose() {
		let { contentEl } = this;
		this.#server?.close();
		contentEl.empty();
	}

	public static createAndOpenNewModal(app: App, account: GoogleAccount, callback: () => void) {
		new AuthModal(app, account, async (code) => {
			new Notice(`Updated authentication token for Google account ${account.accountName}...`);

			account.token = await writeTokenFile(GoogleAccount.credentials, account, code);
			if (!account.token) {
				console.error('could not get token for google account');
				return;
			}
			account.peopleService = await getPeopleService({
				credentials: GoogleAccount.credentials,
				token: account.token
			});
			const loggedInUser = await getAuthenticatedUserEmail({
				service: account.peopleService,
				accountName: account.accountName
			});
			if (loggedInUser) {
				console.log(`setting account name to ${loggedInUser}`);
				account.accountName = loggedInUser;
				account.addToAccountsList();
				GoogleAccount.writeAccountsToStorage();
			}
			callback();
		}).open();
	}
}
