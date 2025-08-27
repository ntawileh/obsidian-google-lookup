import { App, ButtonComponent, Modal, Setting, TextComponent } from 'obsidian';

export class SecureConfirmModal extends Modal {
    private confirmed = false;

    constructor(
        app: App,
        private message: string,
        private confirmationText: string,
        private onConfirm: () => void,
        private onCancel: () => void
    ) {
        super(app);
    }

    onOpen() {
        const { contentEl } = this;
        let submitButton: ButtonComponent;

        contentEl.createEl('p', { text: this.message });
        contentEl.createEl('p', { text: `To confirm, please type:` });
        contentEl.createEl('p').createEl('strong', { text: this.confirmationText });

        new Setting(contentEl)
            .addText((text) => {
                text.setPlaceholder(this.confirmationText);
                text.inputEl.addEventListener('input', () => {
                    if (submitButton) {
                        const isMatch = text.getValue().toLowerCase() === this.confirmationText.toLowerCase();
                        submitButton.setDisabled(!isMatch);
                        if (isMatch) {
                            submitButton.setCta();
                        } else {
                            submitButton.buttonEl.classList.remove('mod-cta');
                        }
                    }
                });
            });

        new Setting(contentEl)
            .addButton((btn) => {
                submitButton = btn;
                btn.setButtonText('Confirm')
                    .setDisabled(true)
                    .onClick(() => {
                        this.confirmed = true;
                        this.onConfirm();
                        this.close();
                    });
            })
            .addButton((btn) =>
                btn.setButtonText('Cancel').onClick(() => {
                    this.close();
                })
            );
    }

    onClose() {
        if (!this.confirmed) {
            this.onCancel();
        }
        this.contentEl.empty();
    }
}
