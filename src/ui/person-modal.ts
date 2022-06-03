import { getPeopleService, searchContactsAndDirectory } from '@/api/google/people-search';
import { GoogleAccount } from '@/models/Account';
import { App, Notice, SuggestModal } from 'obsidian';
import { PersonResult } from '@/types';
import { insertIntoEditorRange, maybeGetSelectedText, renameFile } from '@/utils';
import { Person } from '@/models/Person';
import { AuthModal } from './auth-modal';

export class PersonSuggestModal extends SuggestModal<PersonResult> {
	#initialValue: string | undefined;
	#firstOpen = true;

	async getSuggestions(query: string): Promise<PersonResult[]> {
		if (!this.#firstOpen && query.length < 3) {
			return [];
		}

		if (this.#firstOpen) {
			await this.initServices();
			if (this.#initialValue) {
				query = this.#initialValue;
			}
		}

		this.#firstOpen = false;
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
				AuthModal.createAndOpenNewModal(this.app, account, async () => {
					await this.initServices();
				});

				break;
			}
		}
		return results ? results : [];
	}

	renderSuggestion(person: PersonResult, el: HTMLElement) {
		el.createEl('div', { text: person.displayNameLastFirst });
		el.createEl('small', {
			text: `(${person.accountSource}) ${person.org?.title} ${person.emails ? person.emails[0] : ''}`
		});
	}

	async onChooseSuggestion(person: PersonResult, evt: MouseEvent | KeyboardEvent) {
		new Notice(`Inserted info for ${person.firstName}`);
		const p = new Person(person);
		insertIntoEditorRange(this.app, await p.generateFromTemplate(this.app));
		await renameFile(app, p.makeTitle());
	}

	setInitialValue() {
		const selectedText = maybeGetSelectedText(this.app);
		if (selectedText) {
			this.#initialValue = selectedText;
			return;
		}
		const fileName = this.app.workspace.getActiveFile()?.basename;
		if (fileName) {
			this.#initialValue = fileName;
		}
	}

	async initServices() {
		for (const account of GoogleAccount.getAllAccounts()) {
			account.peopleService = await getPeopleService({
				credentialsFile: account.credentialsFile,
				tokenFile: account.tokenFile
			});
		}
	}

	constructor(app: App) {
		super(app);
		this.emptyStateText = 'no results found';
		this.setInstructions([{ command: 'find contact', purpose: 'search by any contact keyword (first, last, email)' }]);
		this.setInitialValue();
	}
}
