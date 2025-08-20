import { App, PluginSettingTab, Setting } from 'obsidian';
import GoogleLookupPlugin from '@/main';
import { GoogleLookupPluginSettings, KeysMatching } from '@/types';
import { GoogleAccount } from '@/models/Account';
import { AuthModal } from '@/ui/auth-modal';
import { ConfirmModal } from '@/ui/confirm-modal';
import { SecureConfirmModal } from '@/ui/secure-confirm-modal';
import { isApiExposureEnabled, setApiExposure } from './api-exposure';
import { createApi } from '@/api';

export const DEFAULT_SETTINGS: Partial<GoogleLookupPluginSettings> = {
	client_redirect_uri_port: '42601',
	folder_person: '',
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
	accountsEl: HTMLElement;

	constructor(app: App, plugin: GoogleLookupPlugin) {
		super(app, plugin);
		this.plugin = plugin;
		this.accountsEl = this.containerEl.createDiv();
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		if (!this.plugin.settings) {
			return;
		}

		containerEl.createEl('h3', { text: 'Contact Info' });
		this.insertTextInputSetting({
			name: 'Contact Template',
			description: getDocumentFragmentWithLink(
				'File containing template content for contact info.  Default template and more info',
				'available here',
				'https://ntawileh.github.io/obsidian-google-lookup/person'
			),
			placeholder: '_assets/templates/t_person',
			key: 'template_file_person'
		});
		this.insertToggleSetting({
			name: 'Rename and move person file',
			description:
				'When enabled, this will rename the note to the name of the person that was imported and move the note into a folder',
			key: 'rename_person_file'
		});
		this.insertTextInputSetting({
			name: 'Folder for people notes',
			description:
				'When the above option is enabled, the person note will move to this folder.  An empty value (default) means the file will not move to any new directory',
			placeholder: 'people',
			key: 'folder_person'
		});
		this.insertTextInputSetting({
			name: 'Filename format for people notes',
			description: getDocumentFragmentWithLink(
				'When the option to move and rename is enabled, the person note will have a title based on this format.  Default value is "{{lastname}}, {firstname}".  See template options',
				'here',
				'https://ntawileh.github.io/obsidian-google-lookup/person'
			),

			placeholder: '{{lastname}}, {{firstname}}',
			key: 'person_filename_format'
		});
		containerEl.createEl('h3', { text: 'Events Info' });
		this.insertTextInputSetting({
			name: 'Event Template',
			description: getDocumentFragmentWithLink(
				'File containing template content for events.  Default template and more info',
				'available here',
				'https://ntawileh.github.io/obsidian-google-lookup/event'
			),
			placeholder: '_assets/templates/t_event',
			key: 'template_file_event'
		});

		this.insertTextInputSetting({
			name: 'Date Format',
			description: 'Date format to be used on the start date field.',
			placeholder: 'ddd, MMM Do @ hh:mma',
			key: 'event_date_format'
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

		containerEl.createEl('h3', { text: 'Advanced' });
		this.insertSecureApiToggle();

		containerEl.createEl('h3', { text: 'Accounts' });
		this.displayAccounts();
		this.containerEl.appendChild(this.accountsEl);
	}

	private displayAccounts() {
		const { accountsEl } = this;
		accountsEl.empty();
		for (const account of GoogleAccount.getAllAccounts()) {
			this.insertAccountSetting({
				name: account.accountName,
				container: this.accountsEl,
				account
			});
		}
		new Setting(this.accountsEl).addButton((b) => {
			b.setButtonText('Add Account');
			b.setCta();
			b.onClick(() => {
				GoogleAccount.createNewAccount(this.plugin.app, () => {
					this.displayAccounts();
				});
			});
		});
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
						// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
						this.plugin.settings![key] = v;
						await this.plugin.saveSettings();
					})
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					.setValue(this.plugin.settings![key] || '');
			});
	}

	private insertSecureApiToggle() {
		const pluginId = this.plugin.manifest.id;
		new Setting(this.containerEl)
			.setName('Expose API to other plugins')
			.setDesc('Allow other plugins to access the Google Lookup API. This is disabled by default for security.')
			.addToggle((tc) => {
				tc.setValue(isApiExposureEnabled()).onChange(async (v) => {
					if (v) {
						new SecureConfirmModal(
							this.app,
							'This will expose the API to other plugins, which could be a security risk. Please confirm that you want to proceed.',
							'I understand the risk',
							() => {
								setApiExposure(true);
								const plugin = (this.app as any).plugins.plugins[pluginId];
								if (plugin) {
									plugin.api = createApi();
								}
							},
							() => {
								tc.setValue(false);
							}
						).open();
					} else {
						setApiExposure(false);
						const plugin = (this.app as any).plugins.plugins[pluginId];
						if (plugin) {
							plugin.api = undefined;
						}
					}
				});
			});
	}

	private insertToggleSetting({ container = this.containerEl, key, name, description }: ToggleSettingParams) {
		new Setting(container)
			.setName(name)
			.setDesc(description)
			.addToggle((tc) => {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				tc.setValue(this.plugin.settings![key]).onChange(async (v) => {
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					this.plugin.settings![key] = v;
					await this.plugin.saveSettings();
				});
			});
	}
	private insertAccountSetting({
		container = this.containerEl,
		name,
		account
	}: {
		container?: HTMLElement;
		name: string;
		account: GoogleAccount;
	}) {
		new Setting(container)
			.setName(name)
			.addExtraButton((b) => {
				b.setIcon('reset');
				b.setTooltip('refresh account credentials');
				b.onClick(() => {
					AuthModal.createAndOpenNewModal(this.app, account, () => {
						this.displayAccounts();
					});
				});
			})
			.addExtraButton((b) => {
				b.setIcon('trash');
				b.setTooltip('remove account and delete login credentials');
				b.onClick(() => {
					new ConfirmModal(this.app, `Are you sure you want to remove account ${account.accountName}?`, () => {
						console.log(`removing account ${account.accountName}`);
						account.removeFromAccountsList();
						GoogleAccount.writeAccountsToStorage();
						this.displayAccounts();
					}).open();
				});
			});
	}
}

const getDocumentFragmentWithLink = (text: string, linkText: string, href: string) => {
	const fragment = document.createDocumentFragment();
	fragment.createSpan({ text: `${text} ` });
	fragment.createEl('a', {
		href,
		text: linkText
	});

	return fragment;
};
