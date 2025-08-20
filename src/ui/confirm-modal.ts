import { App, Modal, Setting } from 'obsidian';

export class ConfirmModal extends Modal {
	#onConfirm: () => void;
	#message: string;

	constructor(app: App, msg: string, onConfirm: () => void) {
		super(app);
		this.#onConfirm = onConfirm;
		this.#message = msg;
	}

	onOpen() {
		const { contentEl } = this;

		contentEl.createEl('h3', { text: this.#message });

		new Setting(contentEl)

			.addButton((btn) => {
				btn.setButtonText('Cancel').onClick(() => {
					this.close();
				});
			})
			.addButton((btn) =>
				btn
					.setButtonText('Submit')
					.setCta()
					.onClick(() => {
						this.#onConfirm();
						this.close();
					})
			);
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
