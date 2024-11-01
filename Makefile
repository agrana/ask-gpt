# Makefile for building and deploying Obsidian plugin

# Default plugin directory; you can override this with `make PLUGIN_DIR=your_path_here`
PLUGIN_DIR ?= ~/Documents/meta_notes/.obsidian/plugins/ask-gpt/

# Build target
build:
	npm run build

# Copying files to the specified plugin directory
deploy: build
	cp dist/main.js $(PLUGIN_DIR)
	cp manifest.json $(PLUGIN_DIR)
	cp package.json $(PLUGIN_DIR)
	cp styless.css $(PLUGIN_DIR)
	@echo "Files copied to $(PLUGIN_DIR)"

# Clean build artifacts
clean:
	rm -rf dist
	@echo "Build artifacts cleaned."

# Full process: clean, build, deploy
all: clean deploy
	@echo "Build and deploy complete."

# Usage message
help:
	@echo "Available targets:"
	@echo "  build         - Build the plugin using npm"
	@echo "  deploy        - Copy files to the plugin folder (default: $(PLUGIN_DIR))"
	@echo "  clean         - Remove build artifacts"
	@echo "  all           - Clean, build, and deploy"
	@echo "  help          - Show this help message"
	@echo ""
	@echo "You can override PLUGIN_DIR by specifying it like so:"
	@echo "  make deploy PLUGIN_DIR=~/your/custom/path"