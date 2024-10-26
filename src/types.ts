import { Plugin } from 'obsidian';

export interface SystemMessage {
    name: string;
    message: string;
  }
  
  export interface ChatGPTSettings {
    apiKey: string;
    systemMessages: SystemMessage[];
  }
  
  export const DEFAULT_SETTINGS: ChatGPTSettings = {
    apiKey: '',
    systemMessages: [],
  };
 
  
export interface PluginWithSettings {
    settings: ChatGPTSettings;
    saveSettings(): Promise<void>;
  }
  