import { PersonSuggestModal } from '@/ui/person-modal';
import { GoogleAccount } from 'models/Account';
import { App, MarkdownView, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { CalendarView, VIEW_TYPE_EXAMPLE } from '@/views/CalendarView';
import { EventSuggestModal } from '@/ui/calendar-modal';

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
};

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings | undefined;

	async onload() {
		await this.loadSettings();

		this.registerView(VIEW_TYPE_EXAMPLE, (leaf) => new CalendarView(leaf));
		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('This is a notice!');
			this.activateView();
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');

		this.addCommand({
			id: 'insert-google-contact-info',
			name: 'Insert Contact Info',
			checkCallback: (checking: boolean) => {
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					if (!checking) {
						new PersonSuggestModal(this.app).open();
					}
					return true;
				}
			}
		});

		this.addCommand({
			id: 'insert-google-calendar-info',
			name: 'Insert Calendar Event Info',
			checkCallback: (checking: boolean) => {
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					if (!checking) {
						new EventSuggestModal(this.app).open();
					}
					return true;
				}
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			//console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(
			window.setInterval(() => {
				//console.log('setInterval');
			}, 5 * 60 * 1000)
		);

		new GoogleAccount('Seek', '/Users/nadimtawileh/tmp/credentials.json', '/Users/nadimtawileh/tmp/token.json');
		new GoogleAccount(
			'Personal',
			'/Users/nadimtawileh/tmp/credentials.json',
			'/Users/nadimtawileh/tmp/token-tawileh.json'
		);
	}

	onunload() {
		this.app.workspace.detachLeavesOfType(VIEW_TYPE_EXAMPLE);
		GoogleAccount.removeAllAccounts();
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async activateView() {
		this.app.workspace.detachLeavesOfType(VIEW_TYPE_EXAMPLE);

		await this.app.workspace.getRightLeaf(false).setViewState({
			type: VIEW_TYPE_EXAMPLE,
			active: true
		});

		this.app.workspace.revealLeaf(this.app.workspace.getLeavesOfType(VIEW_TYPE_EXAMPLE)[0]);
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
