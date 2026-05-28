# Ensure node is in PATH (Git Bash / GUI clients don't run shell profiles)
if ! command -v node > /dev/null 2>&1; then
  # fnm
  command -v fnm > /dev/null 2>&1 && eval "$(fnm env)"
  # nvm
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
  # volta
  [ -d "$HOME/.volta/bin" ] && export PATH="$HOME/.volta/bin:$PATH"
fi
