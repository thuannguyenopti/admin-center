#!/bin/bash
# Axiom Dev Agents — installer
# Pulls slash commands from GitHub and installs them into ~/.claude/commands/

set -e

REPO="episerver/axiom-play"
BRANCH="main"
DEST="$HOME/.claude/commands"
COMMANDS=("build-dev" "audit-axiom" "push-dev" "figma-builder" "merge-pr")

mkdir -p "$DEST"

# Check for GitHub CLI (required for private repo access)
if ! command -v gh &>/dev/null; then
  echo "Error: GitHub CLI (gh) is required but not installed."
  echo "Install it from https://cli.github.com/ then run: gh auth login"
  exit 1
fi

if ! gh auth status &>/dev/null; then
  echo "Error: Not authenticated with GitHub CLI."
  echo "Run: gh auth login"
  exit 1
fi

echo "Installing Axiom Dev Agents from github.com/$REPO..."
echo ""

for name in "${COMMANDS[@]}"; do
  dest="$DEST/$name.md"
  if gh api "repos/$REPO/contents/.claude/skills/$name/SKILL.md" \
    --header "Accept: application/vnd.github.raw+json" \
    --output "$dest" 2>/dev/null; then
    echo "✓ $name.md"
  else
    echo "✗ Failed to download $name — make sure you have access to github.com/$REPO"
    exit 1
  fi
done

echo ""
echo "Done. Open Claude Code and type / to see your new commands:"
echo "  /build-dev      — Figma → Axiom TSX → compliance review"
echo "  /audit-axiom    — Audit or auto-fix Axiom violations"
echo "  /push-dev       — Compliance → preview → conflict check → PR"
echo "  /figma-builder  — App page → Figma frame with library instances"
echo "  /merge-pr       — Verify CI/Vercel checks → squash-merge PR"
