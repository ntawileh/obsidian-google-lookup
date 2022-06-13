/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { PersonSuggestModal } from '@/ui/person-modal';
import { GoogleAccount } from 'models/Account';
import { Notice, Plugin } from 'obsidian';
import { EventSuggestModal } from '@/ui/calendar-modal';
import { DEFAULT_SETTINGS, GoogleLookupSettingTab } from './settings';
import { GoogleLookupPluginSettings } from './types';
import { getGoogleCredentials, hasGoogleCredentials } from './settings/google-credentials';

export default class GoogleLookupPlugin extends Plugin {
	settings: GoogleLookupPluginSettings | undefined;

	addCommandIfMarkdownView(name: string, id: string, func: () => void) {
		this.addCommand({
			id,
			name,
			editorCallback: () => {
				if (!hasGoogleCredentials(this)) {
					new Notice('Google credentials not set up yet.  Go to Settings to configure.');
					return;
				} else {
					func();
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
