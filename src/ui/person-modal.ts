import { getPeopleService, searchContactsAndDirectory } from '@/api/google/people-search';
import { GoogleAccount } from '@/models/Account';
import { App, Modal, Notice, SuggestModal } from 'obsidian';
import { PersonResult } from '@/types';
import { insertIntoEditorRange, maybeGetSelectedText, renameFile } from '@/utils';
import { Person } from '@/models/Person';
import { AuthModal } from './auth-modal';

type ModalOptions = {
	renameFile: boolean;
	moveToFolder: string;
	template: string | undefined;
};
export class PersonSuggestModal extends SuggestModal<PersonResult> {
	#initialQuery: string | undefined;
	#ready = false;
	#options: ModalOptions;

	async getSuggestions(query: string): Promise<PersonResult[]> {
		!this.#ready && (await this.initServices());
		if (query.length === 0) {
			query = this.#initialQuery ? this.#initialQuery : '';
		}

		if (query.length < 3) {
			return [];
		}

		const results: PersonResult[] = [];

		for (const account of GoogleAccount.getAllAccounts()) {
			if (!account.peopleService) {
				continue;
			}
			const accountResults = await searchContactsAndDirectory(query, {
				service: account.peopleService,
				accountName: account.accountName
			});
			if (accountResults) {
				results.push(...accountResults);
			} else {
				AuthModal.createAndOpenNewModal(this.app, account, () => {
					this.close();
				});

				break;
			}
		}
		return results ? results : [];
	}

	renderSuggestion(person: PersonResult, el: HTMLElement) {
		el.createEl('div', { text: person.displayNameLastFirst });
		el.createEl('small', {
			text: `(${person.accountSource}) ${person.org?.title ? person.org.title : ''} ${
				person.emails ? person.emails[0] : ''
			}`
		});
	}

	async onChooseSuggestion(person: PersonResult, evt: MouseEvent | KeyboardEvent) {
		new Notice(`Inserted info for ${person.firstName}`);
		const p = new Person(person, this.#options.template);
		insertIntoEditorRange(this.app, await p.generateFromTemplate(this.app));
		if (this.#options.renameFile) {
			await renameFile(app, p.makeTitle(), this.#options.moveToFolder);
		}
	}

	private async initServices() {
		for (const account of GoogleAccount.getAllAccounts()) {
			if (account.token) {
				account.peopleService = await getPeopleService({
					credentials: GoogleAccount.credentials,
					token: account.token
				});
			}
		}
		this.#ready = true;
	}

	constructor(app: App, options: ModalOptions) {
		super(app);
		this.#options = options;
		this.emptyStateText =
			GoogleAccount.getAllAccounts().length > 0
				? 'no results found yet'
				: 'no accounts have been added yet.  go to settings to create.';
		this.setInstructions([
			{
				command: 'find contact',
				purpose: 'search by any contact keyword (first, last, email).  Requires at least 3 characters.'
			}
		]);
		const selectedText = maybeGetSelectedText(this.app);
		const fileName = this.app.workspace.getActiveFile()?.basename;

		this.#initialQuery = selectedText ? selectedText : fileName ? fileName : undefined;
	}
}
