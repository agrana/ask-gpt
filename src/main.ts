import { App, Plugin, PluginSettingTab, Setting, Notice, Editor, MarkdownView, MarkdownFileInfo } from 'obsidian';
import { SystemMessageModal } from './SystemMessageModal';
import { ConversationModal } from './ConversationModal';
import { SystemMessage, ChatGPTSettings, DEFAULT_SETTINGS, Conversation, ChatMessage } from './types';
import ChatGPTSettingTab from './ChatGPTSettingTab'; // Import the ChatGPTSettingTab class


export default class MyPlugin extends Plugin {
  settings: ChatGPTSettings = DEFAULT_SETTINGS;
  currentConversationModal: ConversationModal | null = null;

  async onload() {
    await this.loadSettings();
    this.addSettingTab(new ChatGPTSettingTab(this.app, this));

    // Add commands for different interaction modes
    this.addCommand({
      id: 'send-prompt-to-chatgpt',
      name: 'Send Selected Text to ChatGPT (Quick)',
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

    this.addCommand({
      id: 'start-conversation',
      name: 'Start Interactive Conversation',
      callback: () => {
        this.startNewConversation();
      },
      hotkeys: [
        {
          modifiers: ['Mod', 'Shift'],
          key: 'g',
        },
      ],
    });

    this.addCommand({
      id: 'send-file-context',
      name: 'Send File Content as Context',
      editorCallback: (editor: Editor, view: MarkdownView | MarkdownFileInfo) => {
        this.sendFileContext(editor, view);
      },
      hotkeys: [
        {
          modifiers: ['Mod', 'Alt'],
          key: 'g',
        },
      ],
    });

    this.addCommand({
      id: 'continue-conversation',
      name: 'Continue Last Conversation',
      callback: () => {
        this.continueLastConversation();
      },
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

  async callChatGPTWithHistory(messages: ChatMessage[]): Promise<string> {
    const apiKey = this.settings.apiKey;
    const url = 'https://api.openai.com/v1/chat/completions';

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    };

    const body = JSON.stringify({
      model: 'gpt-o1',
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
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

  startNewConversation() {
    if (this.settings.systemMessages.length === 0) {
      new Notice('No system messages configured. Please add one in the plugin settings.');
      return;
    }

    const conversation: Conversation = {
      id: this.generateId(),
      title: 'New Conversation',
      messages: [],
      systemMessage: '',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    this.openConversationModal(conversation);
  }

  continueLastConversation() {
    if (!this.settings.activeConversationId) {
      new Notice('No active conversation found. Start a new conversation first.');
      return;
    }

    const conversation = this.settings.conversations.find(
      conv => conv.id === this.settings.activeConversationId
    );

    if (!conversation) {
      new Notice('Active conversation not found. Starting a new conversation.');
      this.startNewConversation();
      return;
    }

    this.openConversationModal(conversation);
  }

  async sendFileContext(editor: Editor, view: MarkdownView | MarkdownFileInfo) {
    if (this.settings.systemMessages.length === 0) {
      new Notice('No system messages configured. Please add one in the plugin settings.');
      return;
    }

    const fileContent = editor.getValue();
    const fileName = view.file?.name || 'Current File';

    if (!fileContent.trim()) {
      new Notice('File is empty. Nothing to send.');
      return;
    }

    const selectedSystemMessage = await this.selectSystemMessage(this.settings.systemMessages);
    if (!selectedSystemMessage) return;

    const conversation: Conversation = {
      id: this.generateId(),
      title: `File Context: ${fileName}`,
      messages: [
        {
          role: 'user',
          content: `Here is the content of the file "${fileName}":\n\n${fileContent}`,
          timestamp: Date.now()
        }
      ],
      systemMessage: selectedSystemMessage.message,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    this.openConversationModal(conversation);
  }

  openConversationModal(conversation: Conversation) {
    // Close existing modal if open
    if (this.currentConversationModal) {
      this.currentConversationModal.close();
    }

    this.currentConversationModal = new ConversationModal(
      this.app,
      conversation,
      async (message: string) => {
        await this.sendMessageToConversation(conversation, message);
      },
      () => {
        this.startNewConversation();
      },
      async () => {
        return await this.selectSystemMessage(this.settings.systemMessages);
      }
    );

    this.currentConversationModal.open();
  }

  async sendMessageToConversation(conversation: Conversation, message: string) {
    try {
      // Prepare messages for API call
      const messages: ChatMessage[] = [
        {
          role: 'system',
          content: conversation.systemMessage,
          timestamp: Date.now()
        },
        ...conversation.messages,
        {
          role: 'user',
          content: message,
          timestamp: Date.now()
        }
      ];

      const response = await this.callChatGPTWithHistory(messages);
      
      // Add assistant response to conversation
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response,
        timestamp: Date.now()
      };
      conversation.messages.push(assistantMessage);
      conversation.updatedAt = Date.now();

      // Update conversation in settings
      const existingIndex = this.settings.conversations.findIndex(conv => conv.id === conversation.id);
      if (existingIndex >= 0) {
        this.settings.conversations[existingIndex] = conversation;
      } else {
        this.settings.conversations.push(conversation);
      }
      this.settings.activeConversationId = conversation.id;
      await this.saveSettings();

      // Update modal display
      if (this.currentConversationModal) {
        this.currentConversationModal.addAssistantMessage(response);
      }

      new Notice('Response received from ChatGPT!');
    } catch (error) {
      console.error('Error sending message to conversation:', error);
      new Notice('Failed to get a response from ChatGPT.');
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
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
