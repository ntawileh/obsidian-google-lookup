import { PersonSuggestModal } from '@/ui/person-modal';
import { GoogleAccount } from 'models/Account';
import { MarkdownView, Plugin } from 'obsidian';
import { EventSuggestModal } from '@/ui/calendar-modal';
import { DEFAULT_SETTINGS, GoogleLookupSettingTab } from './settings';
import { GoogleLookupPluginSettings } from './types';
import { getGoogleCredentials } from './settings/google-credentials';

export default class GoogleLookupPlugin extends Plugin {
	settings: GoogleLookupPluginSettings | undefined;

	addCommandIfMarkdownView(name: string, id: string, func: () => void) {
		this.addCommand({
			id,
			name,
			checkCallback: (checking: boolean) => {
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					if (!checking) {
						func();
					}
					return true;
				}
			}
		});
	}

	async onload() {
		await this.loadSettings();

		this.addCommandIfMarkdownView('Insert Contact Info', 'insert-contact-info', () => {
			new PersonSuggestModal(this.app, {
				renameFile: this.settings!.rename_person_file,
				template: this.settings!.template_file_person,
				moveToFolder: this.settings!.folder_person
			}).open();
		});
		this.addCommandIfMarkdownView('Insert Event Info', 'insert-event-info', () => {
			new EventSuggestModal(this.app, { template: this.settings!.template_file_event }).open();
		});

		this.addSettingTab(new GoogleLookupSettingTab(this.app, this));

		GoogleAccount.loadAccountsFromStorage();
	}

	onunload() {
		GoogleAccount.removeAllAccounts();
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
		GoogleAccount.credentials = getGoogleCredentials(this);
	}

	async saveSettings() {
		await this.saveData(this.settings);
		GoogleAccount.credentials = getGoogleCredentials(this);
	}
}
