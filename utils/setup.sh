#!/bin/zsh

echo "Starting development environment setup..."

# Install Homebrew if not installed
if ! command -v brew &> /dev/null; then
    echo "Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
else
    echo "Homebrew already installed"
fi

# Install Oh My Zsh if not installed
if [ ! -d "$HOME/.oh-my-zsh" ]; then
    echo "Installing Oh My Zsh..."
    sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
else
    echo "Oh My Zsh already installed"
fi

# Install SDKMAN if not installed
if [ ! -d "$HOME/.sdkman" ]; then
    echo "Installing SDKMAN..."
    curl -s "https://get.sdkman.io" | bash
    source "$HOME/.sdkman/bin/sdkman-init.sh"
else
    echo "SDKMAN already installed"
fi

# Install Git if not installed
if ! command -v git &> /dev/null; then
    echo "Installing Git..."
    brew install git
else
    echo "Git already installed"
fi

# Install Docker if not installed
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    brew install --cask docker
else
    echo "Docker already installed"
fi

# Install Helm if not installed
if ! command -v helm &> /dev/null; then
    echo "Installing Helm..."
    brew install helm
else
    echo "Helm already installed"
fi

# Install Kind if not installed
if ! command -v kind &> /dev/null; then
    echo "Installing Kind..."
    brew install kind
else
    echo "Kind already installed"
fi

# Install Go if not installed
if ! command -v go &> /dev/null; then
    echo "Installing Go..."
    brew install go
else
    echo "Go already installed"
fi

# Install direnv if not installed
if ! command -v direnv &> /dev/null; then
    echo "Installing direnv..."
    brew install direnv
else
    echo "Direnv already installed"
fi

# set up direnv in zshrc if not already set
if ! grep -q 'eval "$(direnv hook zsh)"' "$HOME/.zshrc"; then
    echo 'eval "$(direnv hook zsh)"' >> "$HOME/.zshrc"
    echo "Added direnv hook to .zshrc"
else
    echo "Direnv hook already present in .zshrc"
fi

# Configure keyboard settings
echo "Configuring keyboard settings..."
defaults write -g InitialKeyRepeat -int 12
defaults write -g KeyRepeat -int 1.5

echo "Setup complete! Please restart your terminal to apply all changes."

# Download your favorite JVM distribution and add it to sdkman
# 
# sdk install java zulu-25.jdk /usr/local/zulu-25.jdk/Contents/Home