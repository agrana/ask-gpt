Certainly! Here's a `README.md` file for your Obsidian ChatGPT plugin:

---

# Obsidian ChatGPT Plugin

A plugin for [Obsidian](https://obsidian.md/) that allows you to interact with OpenAI's ChatGPT directly from your editor. Select text in your markdown files and send it to ChatGPT to receive AI-generated responses. Customize the assistant's behavior using a system message and integrate the responses seamlessly into your notes.

## Features

- **Send Selected Text to ChatGPT**: Select any text in your editor and send it to ChatGPT with a simple command or keyboard shortcut.
- **Customizable System Message**: Define a system message (prefix) to set the assistant's behavior or personality.
- **API Key Configuration**: Securely store your OpenAI API key within the plugin settings.
- **Inline Responses**: Insert ChatGPT's responses directly into your notes, right after your prompt.

## Demo


![Obsidian ChatGPT Plugin Demo](demo.gif)

*TODO: Replace with an actual GIF.*

## Installation

### Manual Installation

1. **Download the Plugin**

   - Clone this repository or download the ZIP file and extract it.

2. **Copy to Obsidian Plugins Folder**

   - Locate your Obsidian vault directory.
   - Navigate to the `.obsidian/plugins/` folder within your vault. If the `plugins` folder doesn't exist, create it.
   - Create a new folder named `obsidian-chatgpt-plugin` and copy the plugin files into this folder.

3. **Install Dependencies**

   - Open a terminal in the `obsidian-chatgpt-plugin` folder.
   - Run `npm install` to install necessary dependencies.

4. **Build the Plugin**

   - Run `npm run build` to compile the TypeScript code.

5. **Enable the Plugin in Obsidian**

   - Open Obsidian.
   - Go to `Settings` > `Community Plugins`.
   - Click on `Reload Plugins`.
   - Find `AskGpt` in the list and toggle it on.

## Usage

1. **Set Up Your API Key**

   - Go to `Settings` > `AskGpt Settings`.
   - Enter your OpenAI API key in the `API Key` field.
   - *Note: You can obtain an API key from [OpenAI's website](https://platform.openai.com/account/api-keys).*

2. **Configure the System Message (Optional)**

   - In the same settings tab, enter a system message in the `Prefix (System Message)` field.
   - This message sets the assistant's behavior or personality (e.g., `"You are a helpful assistant that provides concise answers."`).

3. **Send Text to ChatGPT**

   - Open a markdown file in Obsidian.
   - Select the text you want to send to ChatGPT.
   - Use the command palette (`Ctrl+P` or `Cmd+P`) and run `Send Prompt to ChatGPT`, or use the keyboard shortcut `Ctrl+G` (`Cmd+G` on Mac).
   - Select the system message you want to use.


4. **View the Response**

   - The plugin will insert the text response after the selected text.

## Settings

- **API Key**

  - Your OpenAI API key required to authenticate with the ChatGPT API.

- **Prefix (System Message)**

  - A system message that sets the context or behavior of the assistant.
  - This can be a personality description, instructions, or any information that influences the assistant's responses.

## Keyboard Shortcuts

- **Default Shortcut**

  - `Ctrl+G` (`Cmd+G` on Mac): Sends the selected text to ChatGPT.

- **Customization**

  - You can customize the keyboard shortcut in Obsidian's hotkey settings:
    - Go to `Settings` > `Hotkeys`.
    - Search for `Send Prompt to ChatGPT`.
    - Assign your preferred shortcut.

## Troubleshooting

- **No Text Selected**

  - If you try to send a prompt without selecting any text, the plugin will display a notice: `Please select some text to send to ChatGPT.`

- **Missing API Key**

  - If the API key is not set, you'll receive a notice: `API Key is missing. Please set it in the plugin settings.`

- **API Errors**

  - If there's an issue with the API call, a notice will display the error message.
  - Check the console (`Ctrl+Shift+I` or `Cmd+Option+I`) for detailed error logs.

## Privacy and Security

- **API Key Storage**

  - Your API key is stored securely within Obsidian's plugin settings and is not shared with any third parties besides OpenAI.

- **Data Sent to OpenAI**

  - The selected text and system message are sent to OpenAI's API to generate responses.
  - Ensure that you do not send any sensitive or confidential information.

## Contributing

Contributions are welcome! If you have suggestions, bug reports, or want to contribute code:

1. Fork the repository.
2. Create a new branch: `git checkout -b feature/YourFeature`
3. Commit your changes: `git commit -am 'Add your feature'`
4. Push to the branch: `git push origin feature/YourFeature`
5. Submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE).

