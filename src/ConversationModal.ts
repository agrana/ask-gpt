import { App, Modal, Setting, TextAreaComponent, ButtonComponent, Notice } from 'obsidian';
import { Conversation, ChatMessage, SystemMessage } from './types';

export class ConversationModal extends Modal {
  conversation: Conversation;
  onSendMessage: (message: string) => Promise<void>;
  onNewConversation: () => void;
  onSelectSystemMessage: () => Promise<SystemMessage | null>;
  systemMessage: SystemMessage | null = null;
  isWaitingForResponse: boolean = false;

  constructor(
    app: App, 
    conversation: Conversation,
    onSendMessage: (message: string) => Promise<void>,
    onNewConversation: () => void,
    onSelectSystemMessage: () => Promise<SystemMessage | null>
  ) {
    super(app);
    this.conversation = conversation;
    this.onSendMessage = onSendMessage;
    this.onNewConversation = onNewConversation;
    this.onSelectSystemMessage = onSelectSystemMessage;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();

    // Header
    const header = contentEl.createDiv('conversation-header');
    header.createEl('h2', { text: this.conversation.title || 'New Conversation' });

    // System message display
    const systemMessageDiv = contentEl.createDiv('system-message-display');
    systemMessageDiv.createEl('h4', { text: 'System Message:' });
    const systemMessageText = systemMessageDiv.createEl('p', { 
      text: this.systemMessage?.message || 'No system message selected' 
    });
    systemMessageText.addClass('system-message-text');

    // System message selector
    new Setting(contentEl)
      .setName('System Message')
      .setDesc('Select a system message for this conversation')
      .addButton((btn) =>
        btn
          .setButtonText(this.systemMessage ? this.systemMessage.name : 'Select System Message')
          .onClick(async () => {
            const selected = await this.onSelectSystemMessage();
            if (selected) {
              this.systemMessage = selected;
              systemMessageText.setText(selected.message);
              this.conversation.systemMessage = selected.message;
              this.refresh();
            }
          })
      );

    // Messages container
    const messagesContainer = contentEl.createDiv('messages-container');
    messagesContainer.addClass('conversation-messages');

    // Render messages
    this.renderMessages(messagesContainer);

    // Input area
    const inputContainer = contentEl.createDiv('input-container');
    inputContainer.addClass('conversation-input');

    const textArea = new TextAreaComponent(inputContainer)
      .setPlaceholder('Type your message here...')
      .setValue('');
    
    textArea.inputEl.addEventListener('input', (e) => {
      this.currentMessage = (e.target as HTMLTextAreaElement).value;
    });

    textArea.inputEl.rows = 3;
    textArea.inputEl.addClass('message-input');

    // Send button
    const sendButtonContainer = inputContainer.createDiv('send-button-container');
    const sendButton = sendButtonContainer.createEl('button', {
      text: 'Send',
      cls: 'mod-cta'
    });
    
    sendButton.addEventListener('click', async () => {
      if (this.currentMessage.trim() && !this.isWaitingForResponse) {
        await this.sendMessage(this.currentMessage.trim());
        textArea.setValue('');
        this.currentMessage = '';
      }
    });

    // Action buttons
    const actionContainer = contentEl.createDiv('action-buttons');
    
    new Setting(actionContainer)
      .addButton((btn) =>
        btn
          .setButtonText('New Conversation')
          .onClick(() => {
            this.onNewConversation();
            this.close();
          })
      )
      .addButton((btn) =>
        btn
          .setButtonText('Close')
          .onClick(() => this.close())
      );

    // Store reference to textarea for sending
    this.textArea = textArea;
    this.sendButton = sendButton;
  }

  private currentMessage: string = '';
  private textArea!: TextAreaComponent;
  private sendButton!: HTMLButtonElement;

  private renderMessages(container: HTMLElement) {
    container.empty();
    
    this.conversation.messages.forEach((message) => {
      const messageDiv = container.createDiv('message');
      messageDiv.addClass(`message-${message.role}`);
      
      const roleDiv = messageDiv.createDiv('message-role');
      roleDiv.textContent = message.role === 'user' ? 'You' : 'Assistant';
      roleDiv.addClass('role-label');
      
      const contentDiv = messageDiv.createDiv('message-content');
      contentDiv.textContent = message.content;
      
      const timestampDiv = messageDiv.createDiv('message-timestamp');
      timestampDiv.textContent = new Date(message.timestamp).toLocaleTimeString();
      timestampDiv.addClass('timestamp');
    });

    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
  }

  private async sendMessage(message: string) {
    if (!this.systemMessage) {
      new Notice('Please select a system message first.');
      return;
    }

    this.isWaitingForResponse = true;
    this.sendButton.textContent = 'Sending...';
    this.sendButton.disabled = true;

    // Add user message to conversation
    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: Date.now()
    };
    this.conversation.messages.push(userMessage);

    // Refresh messages display
    const messagesContainer = this.contentEl.querySelector('.messages-container') as HTMLElement;
    this.renderMessages(messagesContainer);

    try {
      await this.onSendMessage(message);
    } catch (error) {
      console.error('Error sending message:', error);
      new Notice('Failed to send message. Please try again.');
    } finally {
      this.isWaitingForResponse = false;
      this.sendButton.textContent = 'Send';
      this.sendButton.disabled = false;
    }
  }

  public addAssistantMessage(content: string) {
    const assistantMessage: ChatMessage = {
      role: 'assistant',
      content: content,
      timestamp: Date.now()
    };
    this.conversation.messages.push(assistantMessage);

    // Refresh messages display
    const messagesContainer = this.contentEl.querySelector('.messages-container') as HTMLElement;
    this.renderMessages(messagesContainer);
  }

  public refresh() {
    this.onOpen();
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}
