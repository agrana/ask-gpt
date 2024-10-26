import { App, PluginSettingTab, Setting, Plugin } from 'obsidian';
import { PluginWithSettings } from './types';

export default class ChatGPTSettingTab extends PluginSettingTab {
  plugin: PluginWithSettings;

  constructor(app: App, plugin: PluginWithSettings & Plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void { 
    const { containerEl } = this;

    containerEl.empty();
    containerEl.createEl('h2', { text: 'ChatGPT Plugin Settings' });

    // API Key Setting
    new Setting(containerEl)
      .setName('API Key')
      .setDesc('Enter your OpenAI API key')
      .addText((text) =>
        text
          .setPlaceholder('Enter your API key')
          .setValue(this.plugin.settings.apiKey)
          .onChange(async (value) => {
            this.plugin.settings.apiKey = value;
            await this.plugin.saveSettings();
          })
      );

    containerEl.createEl('h3', { text: 'System Messages' });

    // Display existing system messages
    this.plugin.settings.systemMessages.forEach((msg, index) => {
      const setting = new Setting(containerEl)
        .setHeading()
        .setName(`Message ${index + 1}: ${msg.name}`);

      // Name
      setting.addText((text) =>
        text
          .setPlaceholder('Name')
          .setValue(msg.name)
          .onChange(async (value) => {
            msg.name = value;
            await this.plugin.saveSettings();
          })
      );

      // Message
      setting.addTextArea((textArea) => {
        textArea
          .setPlaceholder('System Message')
          .setValue(msg.message)
          .onChange(async (value) => {
            msg.message = value;
            await this.plugin.saveSettings();
          });
        textArea.inputEl.rows = 3;
      });

      // Delete Button
      setting.addExtraButton((button) =>
        button
          .setIcon('trash')
          .setTooltip('Delete')
          .onClick(async () => {
            this.plugin.settings.systemMessages.splice(index, 1);
            await this.plugin.saveSettings();
            this.display();
          })
      );
    });

    // Add New System Message
    new Setting(containerEl).addButton((button) =>
      button
        .setButtonText('Add System Message')
        .setCta()
        .onClick(async () => {
          this.plugin.settings.systemMessages.push({
            name: `Message ${this.plugin.settings.systemMessages.length + 1}`,
            message: '',
          });
          await this.plugin.saveSettings();
          this.display();
        })
    );
  }
}