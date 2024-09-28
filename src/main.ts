import { App, Plugin, PluginSettingTab, Setting, Notice, Editor, MarkdownView } from 'obsidian';

interface ChatGPTSettings {
  apiKey: string;
  prefix: string;
}

const DEFAULT_SETTINGS: ChatGPTSettings = {
  apiKey: '',
  prefix: ''
};

class ChatGPTSettingTab extends PluginSettingTab {
  plugin: MyPlugin;

  constructor(app: App, plugin: MyPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    let { containerEl } = this;

    containerEl.empty();

    containerEl.createEl('h2', { text: 'ChatGPT Plugin Settings' });

    new Setting(containerEl)
      .setName('API Key')
      .setDesc('Enter your OpenAI API key')
      .addText(text => text
        .setPlaceholder('Enter your API key')
        .setValue(this.plugin.settings.apiKey)
        .onChange(async (value) => {
          this.plugin.settings.apiKey = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Prefix')
      .setDesc('Enter a prefix for the prompt (e.g., "Review:", "Summarize:")')
      .addText(text => text
        .setPlaceholder('Enter a prefix')
        .setValue(this.plugin.settings.prefix)
        .onChange(async (value) => {
          this.plugin.settings.prefix = value;
          await this.plugin.saveSettings();
        }));
  }
}

export default class MyPlugin extends Plugin {
  settings: ChatGPTSettings = DEFAULT_SETTINGS;

  async onload() {
    await this.loadSettings();

    this.addCommand({
      id: 'send-prompt-to-chatgpt',
      name: 'Send Prompt to ChatGPT',
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.handleEditorCallback(editor, view);
      },
      hotkeys: [
        {
          modifiers: ["Mod"],
          key: "g",
        },
      ],
    });

    this.addSettingTab(new ChatGPTSettingTab(this.app, this));
  }

  async handleEditorCallback(editor: Editor, view: MarkdownView) {
    const prompt = editor.getSelection();
    if (!prompt) {
      new Notice('Please select some text to send to ChatGPT.');
      return;
    }

    const response = await this.callChatGPT(prompt, view);
    if (response) {
      editor.replaceSelection(`${prompt}\n\n${response}`);
      new Notice('Response received from ChatGPT!');
    }
  }

  async callChatGPT(prompt: string, view: MarkdownView): Promise<string> {
    const apiKey = this.settings.apiKey;
    const prefix = this.settings.prefix;
    const url = 'https://api.openai.com/v1/chat/completions';

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    };

    const body = JSON.stringify({
      model: "gpt-3.5-turbo", // Use a valid model name
      messages: [{ role: "user", content: `${prefix} ${prompt}` }],
      max_tokens: 1024
    });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: body
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`OpenAI API Error: ${errorText}`);
        throw new Error(`OpenAI API returned an error: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
        console.error('Unexpected API response format:', data);
        throw new Error('Unexpected API response format.');
      }

      return data.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      throw new Error('Failed to call OpenAI API.');
    }
  }

  onunload() {
    console.log('unloading plugin');
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}