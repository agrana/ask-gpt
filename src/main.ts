import { App, Plugin, PluginSettingTab, Setting, Notice, Editor, MarkdownView, MarkdownFileInfo } from 'obsidian';
import { SystemMessageModal } from './SystemMessageModal';
import { SystemMessage, ChatGPTSettings, DEFAULT_SETTINGS } from './types';
import ChatGPTSettingTab from './ChatGPTSettingTab'; // Import the ChatGPTSettingTab class


export default class MyPlugin extends Plugin {
  settings: ChatGPTSettings = DEFAULT_SETTINGS;

  async onload() {
    await this.loadSettings();
    this.addSettingTab(new ChatGPTSettingTab(this.app, this));

    // Add a single command that opens the system message selection modal
    this.addCommand({
      id: 'send-prompt-to-chatgpt',
      name: 'Send Prompt to ChatGPT',
      editorCallback: (editor: Editor, view: MarkdownView | MarkdownFileInfo) => {
        this.showSystemMessageSelection(editor);
      },
      hotkeys: [
        {
          modifiers: ['Mod'],
          key: 'g',
        },
      ],
    });
  }

  async showSystemMessageSelection(editor: Editor) {
    const prompt = editor.getSelection();
    if (!prompt) {
      new Notice('Please select some text to send to ChatGPT.');
      return;
    }

    if (this.settings.systemMessages.length === 0) {
      new Notice('No system messages configured. Please add one in the plugin settings.');
      return;
    }

    const selectedSystemMessage = await this.selectSystemMessage(this.settings.systemMessages);

    if (selectedSystemMessage) {
      try {
        const response = await this.callChatGPT(prompt, selectedSystemMessage.message);
        editor.replaceSelection(`${prompt}\n\n${response}`);
        new Notice('Response received from ChatGPT!');
      } catch (error) {
        console.error('Error calling ChatGPT:', error);
        new Notice('Failed to get a response from ChatGPT.');
      }
    }
  }

  async selectSystemMessage(options: SystemMessage[]): Promise<SystemMessage | null> {
    return new Promise((resolve) => {
      const modal = new SystemMessageModal(this.app, options, resolve);
      modal.open();
    });
  }

  async callChatGPT(prompt: string, systemMessage: string): Promise<string> {
    const apiKey = this.settings.apiKey;
    const url = 'https://api.openai.com/v1/chat/completions';

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    };

    const body = JSON.stringify({
      model: 'gpt-o1',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: prompt },
      ],
      max_tokens: 1024,
    });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: body,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`OpenAI API Error: ${errorText}`);
        throw new Error(`OpenAI API returned an error: ${response.statusText}`);
      }

      const data = await response.json();

      if (
        !data.choices ||
        !data.choices[0] ||
        !data.choices[0].message ||
        !data.choices[0].message.content
      ) {
        console.error('Unexpected API response format:', data);
        throw new Error('Unexpected API response format.');
      }

      return data.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      throw error;
    }
  }

  onunload() {
    console.log('Unloading ChatGPT plugin');
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
