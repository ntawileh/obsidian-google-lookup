import { App, PluginSettingTab, Setting } from 'obsidian';
import GoogleLookupPlugin from '@/main';
import { GoogleLookupPluginSettings, KeysMatching } from '@/types';

export const DEFAULT_SETTINGS: Partial<GoogleLookupPluginSettings> = {
	client_redirect_uri_port: '42601',
	client_id: '651639932442-b5eo1a6f29i72ggu72h0vftuhtt2jtgg.apps.googleusercontent.com',
	client_secret: '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',
	rename_person_file: true
};

type CommonSettingParams = {
	container?: HTMLElement;
	name: string;
	description: string | DocumentFragment;
};
type ToggleSettingParams = { key: KeysMatching<GoogleLookupPluginSettings, boolean> } & CommonSettingParams;

type TextInputSettingParams = {
	placeholder?: string;
	key: KeysMatching<GoogleLookupPluginSettings, string>;
} & CommonSettingParams;

export class GoogleLookupSettingTab extends PluginSettingTab {
	plugin: GoogleLookupPlugin;

	constructor(app: App, plugin: GoogleLookupPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		if (!this.plugin.settings) {
			return;
		}

		containerEl.createEl('h3', { text: 'General' });
		containerEl.createEl('h3', { text: 'Templates' });
		this.insertTextInputSetting({
			name: 'Contact Template',
			description: 'Template for inserting contact info.  Default template can be found here.',
			placeholder: '_assets/templates/t_person',
			key: 'template_file_person'
		});
		this.insertToggleSetting({
			name: 'Rename person file',
			description: 'When enabled, this will rename the note to the name of the person that was imported',
			key: 'rename_person_file'
		});
		this.insertTextInputSetting({
			name: 'Event Template',
			description: 'Template for inserting event info.  Default template can be found here.',
			placeholder: '_assets/templates/t_event',
			key: 'template_file_event'
		});

		containerEl.createEl('h3', { text: 'Google Client' });
		this.insertTextInputSetting({
			name: 'Client ID',
			description: 'Client ID for your Google API application',
			placeholder: '123456789123-example29i02ttu92h0vftuhff2jtgg.apps.googleusercontent.com',
			key: 'client_id'
		});
		this.insertTextInputSetting({
			name: 'Client Secret',
			description: 'Client Secret for your Google API application',
			key: 'client_secret'
		});
		this.insertTextInputSetting({
			name: 'Redirect URI port',
			description:
				'The port number that this Obsidian plugin will listen to Google authentication redirects on.  Do not change this unless you are having issues.',
			key: 'client_redirect_uri_port'
		});

		containerEl.createEl('h3', { text: 'Advanced Settings' });
	}
	private insertTextInputSetting({
		container = this.containerEl,
		placeholder,
		key,
		name,
		description
	}: TextInputSettingParams) {
		new Setting(container)
			.setName(name)
			.setDesc(description)
			.addText((text) => {
				text
					.setPlaceholder(placeholder ? placeholder : '')
					.onChange(async (v) => {
						this.plugin.settings![key] = v;
						await this.plugin.saveSettings();
					})
					.setValue(this.plugin.settings![key] || '');
			});
	}
	private insertToggleSetting({ container = this.containerEl, key, name, description }: ToggleSettingParams) {
		new Setting(container)
			.setName(name)
			.setDesc(description)
			.addToggle((tc) => {
				tc.setValue(this.plugin.settings![key]).onChange(async (v) => {
					this.plugin.settings![key] = v;
					await this.plugin.saveSettings();
				});
			});
	}
}
