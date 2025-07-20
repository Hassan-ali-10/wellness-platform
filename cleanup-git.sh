#!/bin/bash

# cleanup-git.sh
# This script removes node_modules from git history, adds a proper .gitignore, and force pushes cleaned history.

set -e

# Step 1: Create .gitignore if not present
echo "Creating .gitignore ..."
cat <<EOL > .gitignore
# Dependencies
node_modules/

# Next.js build
.next/
out/

# Build artifacts
dist/
build/

# Logs
*.log

# Env
.env
.env.*

# OS
.DS_Store
EOL

# Step 2: Remove node_modules from repository
echo "Removing node_modules from Git ..."
git rm -r --cached node_modules || true

git add .gitignore
git commit -m "Remove node_modules and add .gitignore" || true

# Step 3: Use git-filter-repo to clean history if available
if command -v git-filter-repo >/dev/null 2>&1; then
  echo "Cleaning history with git-filter-repo ..."
  git filter-repo --path node_modules --invert-paths --force
else
  echo "git-filter-repo not installed. Please install it (e.g., brew install git-filter-repo) and rerun this script."
  exit 1
fi

# Step 4: Force push changes
echo "Force pushing cleaned repo ..."
git push origin main --force

echo "✅ Cleanup complete!"
