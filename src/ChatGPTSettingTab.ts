import { App, PluginSettingTab, Setting, Plugin, Notice } from 'obsidian';
import { PluginWithSettings, Conversation } from './types';

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
          .inputEl.type = "password"
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

    // Conversations Section
    containerEl.createEl('h3', { text: 'Conversations' });

    if (this.plugin.settings.conversations.length === 0) {
      containerEl.createEl('p', { 
        text: 'No conversations yet. Start a conversation using the commands.',
        cls: 'setting-item-description'
      });
    } else {
      // Display conversations
      this.plugin.settings.conversations.forEach((conversation, index) => {
        const setting = new Setting(containerEl)
          .setHeading()
          .setName(`Conversation ${index + 1}: ${conversation.title}`);

        // Conversation info
        setting.addText((text) =>
          text
            .setPlaceholder('Conversation Title')
            .setValue(conversation.title)
            .onChange(async (value) => {
              conversation.title = value;
              await this.plugin.saveSettings();
            })
        );

        // Message count
        setting.addText((text) =>
          text
            .setValue(`${conversation.messages.length} messages`)
            .setDisabled(true)
        );

        // Continue conversation button
        setting.addButton((btn) =>
          btn
            .setButtonText('Continue')
            .onClick(() => {
              if ('openConversationModal' in this.plugin) {
                (this.plugin as any).openConversationModal(conversation);
              }
            })
        );

        // Delete conversation button
        setting.addExtraButton((button) =>
          button
            .setIcon('trash')
            .setTooltip('Delete Conversation')
            .onClick(async () => {
              this.plugin.settings.conversations.splice(index, 1);
              if (this.plugin.settings.activeConversationId === conversation.id) {
                this.plugin.settings.activeConversationId = null;
              }
              await this.plugin.saveSettings();
              this.display();
            })
        );
      });

      // Clear all conversations
      new Setting(containerEl).addButton((button) =>
        button
          .setButtonText('Clear All Conversations')
          .setWarning()
          .onClick(async () => {
            this.plugin.settings.conversations = [];
            this.plugin.settings.activeConversationId = null;
            await this.plugin.saveSettings();
            this.display();
            new Notice('All conversations cleared.');
          })
      );
    }
  }
}