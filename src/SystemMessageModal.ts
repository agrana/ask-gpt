import { App, Modal, Setting } from 'obsidian';
import { SystemMessage } from './types';

export class SystemMessageModal extends Modal {
  options: SystemMessage[];
  onChoose: (value: SystemMessage | null) => void;

  constructor(app: App, options: SystemMessage[], onChoose: (value: SystemMessage | null) => void) {
    super(app);
    this.options = options;
    this.onChoose = onChoose;
  }

  onOpen() {
    const { contentEl } = this;

    contentEl.createEl('h2', { text: 'Select a System Message' });

    this.options.forEach((option) => {
      new Setting(contentEl)
        .setName(option.name)
        .setDesc(option.message)
        .addButton((btn) =>
          btn
            .setButtonText('Select')
            .onClick(() => {
              this.onChoose(option);
              this.close();
            })
        );
    });

    // Cancel Button
    new Setting(contentEl).addButton((btn) =>
      btn.setButtonText('Cancel').onClick(() => {
        this.onChoose(null);
        this.close();
      })
    );
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}
