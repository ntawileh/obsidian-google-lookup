import { PersonSuggestModal } from '@/ui/person-modal';
import { GoogleAccount } from 'models/Account';
import { App, MarkdownView, Notice, Plugin, PluginSettingTab, Setting, SuggestModal } from 'obsidian';
import { EventSuggestModal } from '@/ui/calendar-modal';

// TODO: Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
};

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings | undefined;

	addCommandIfMarkdownView<T extends SuggestModal<any>>(name: string, id: string, obj: T) {
		this.addCommand({
			id,
			name,
			checkCallback: (checking: boolean) => {
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					if (!checking) {
						obj.open();
					}
					return true;
				}
			}
		});
	}

	async onload() {
		await this.loadSettings();

		this.addCommandIfMarkdownView('Insert Contact Info', 'insert-contact-info', new PersonSuggestModal(this.app));
		this.addCommandIfMarkdownView('Insert Event Info', 'insert-event-info', new EventSuggestModal(this.app));

		this.addSettingTab(new SampleSettingTab(this.app, this));

		new GoogleAccount('Seek', '/Users/nadimtawileh/tmp/credentials.json', '/Users/nadimtawileh/tmp/token.json');
		new GoogleAccount(
			'Personal',
			'/Users/nadimtawileh/tmp/credentials.json',
			'/Users/nadimtawileh/tmp/token-tawileh.json'
		);
	}

	onunload() {
		GoogleAccount.removeAllAccounts();
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h2', { text: 'Settings for my awesome plugin.' });

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc("It's a secret")
			.addText((text) => {
				if (!this.plugin.settings) {
					return;
				}
				text
					.setPlaceholder('Enter your secret')
					.setValue(this.plugin.settings.mySetting)
					.onChange(async (value) => {
						console.log('Secret: ' + value);

						if (!this.plugin.settings) {
							return;
						}
						this.plugin.settings.mySetting = value;
						await this.plugin.saveSettings();
					});
			});
	}
}
