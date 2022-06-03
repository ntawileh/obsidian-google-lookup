import { getCalendarService, searchCalendarEvents } from '@/api/google/calendar-search';
import { GoogleAccount } from '@/models/Account';
import { App, Notice, SuggestModal } from 'obsidian';
import { EventResult } from '@/types';
import { insertIntoEditorRange, maybeGetSelectedText } from '@/utils';
import { Event } from '@/models/Event';
import { AuthModal } from './auth-modal';

export class EventSuggestModal extends SuggestModal<EventResult> {
	#initialValue: string | undefined;
	#firstOpen = true;

	async getSuggestions(query: string): Promise<EventResult[]> {
		if (!this.#firstOpen && query.length < 6) {
			return [];
		}

		if (this.#firstOpen) {
			await this.initServices();
			if (this.#initialValue) {
				query = this.#initialValue;
			}
		}

		this.#firstOpen = false;

		const queryMoment = window.moment(query);
		if (!queryMoment.isValid()) {
			return [];
		}

		console.log(queryMoment);

		const results: EventResult[] = [];

		for (const account of GoogleAccount.getAllAccounts()) {
			if (!account.calendarService) {
				continue;
			}
			const accountResults = await searchCalendarEvents(queryMoment, {
				service: account.calendarService,
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

	renderSuggestion(event: EventResult, el: HTMLElement) {
		const startMoment = window.moment(event.startTime);
		el.createEl('div', { text: event.summary });
		el.createEl('small', {
			text: `@ ${startMoment.format('hh:mma')}, ${startMoment.fromNow()}`
		});
	}

	async onChooseSuggestion(event: EventResult, evt: MouseEvent | KeyboardEvent) {
		new Notice(`Inserted info for ${event.summary}`);
		const e = new Event(event);
		insertIntoEditorRange(this.app, await e.generateFromTemplate(this.app));
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
			account.calendarService = await getCalendarService({
				credentialsFile: account.credentialsFile,
				tokenFile: account.tokenFile
			});
		}
	}

	constructor(app: App) {
		super(app);
		this.emptyStateText = 'no results found';
		this.setInstructions([{ command: 'search by date', purpose: 'for example "2022-05-05"' }]);
		this.setInitialValue();
	}
}
