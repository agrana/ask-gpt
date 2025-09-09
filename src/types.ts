import { Plugin } from 'obsidian';

export interface SystemMessage {
    name: string;
    message: string;
  }

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
  }

export interface Conversation {
    id: string;
    title: string;
    messages: ChatMessage[];
    systemMessage: string;
    createdAt: number;
    updatedAt: number;
  }
  
  export interface ChatGPTSettings {
    apiKey: string;
    systemMessages: SystemMessage[];
    conversations: Conversation[];
    activeConversationId: string | null;
  }
  
  export const DEFAULT_SETTINGS: ChatGPTSettings = {
    apiKey: '',
    systemMessages: [],
    conversations: [],
    activeConversationId: null,
  };
 
  
export interface PluginWithSettings {
    settings: ChatGPTSettings;
    saveSettings(): Promise<void>;
  }
  