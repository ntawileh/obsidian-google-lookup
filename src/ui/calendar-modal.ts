import { getCalendarService, searchCalendarEvents } from '@/api/google/calendar-search';
import { GoogleAccount } from '@/models/Account';
import { App, moment, Notice, SuggestModal } from 'obsidian';
import { EventResult } from '@/types';
import { insertIntoEditorRange, maybeGetSelectedText } from '@/utils';
import { Event } from '@/models/Event';
import { AuthModal } from './auth-modal';

type ModalOptions = {
	template: string | undefined;
	dateFormat: string | undefined;
};
export class EventSuggestModal extends SuggestModal<EventResult> {
	#initialQuery: moment.Moment;
	#ready = false;
	#options: ModalOptions;

	async getSuggestions(query: string): Promise<EventResult[]> {
		!this.#ready && (await this.initServices());

		if (query.length > 0 && query.length < 6) {
			return [];
		}

		const queryMoment = query.length < 1 ? this.#initialQuery : moment(query);
		if (!queryMoment.isValid()) {
			return [];
		}

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
				AuthModal.createAndOpenNewModal(this.app, account, () => {
					this.close();
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
		const e = new Event(event, this.#options.template, this.#options.dateFormat);
		insertIntoEditorRange(this.app, await e.generateFromTemplate(this.app));
	}

	private async initServices() {
		for (const account of GoogleAccount.getAllAccounts()) {
			if (account.token) {
				account.calendarService = await getCalendarService({
					credentials: GoogleAccount.credentials,
					token: account.token
				});
			}
		}
		this.#ready = true;
	}

	constructor(app: App, options: ModalOptions) {
		super(app);
		const selectedText = maybeGetSelectedText(this.app);
		const fileName = this.app.workspace.getActiveFile()?.basename;
		this.#options = options;

		this.emptyStateText =
			GoogleAccount.getAllAccounts().length > 0
				? 'no results found yet'
				: 'no accounts have been added yet.  go to settings to create.';

		this.setInstructions([{ command: 'search by date', purpose: 'for example "2022-05-05"' }]);

		for (const t of [selectedText, fileName]) {
			if (!t) {
				continue;
			}
			const m = moment(t);
			if (m.isValid()) {
				this.#initialQuery = m;
				return;
			}
		}

		this.#initialQuery = moment();
	}
}
