#!/bin/bash
# Install dida365-cli agent skill for Claude Code
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/YOUR_GITHUB_USERNAME/dida365-ai-tools/main/scripts/install-skill.sh | bash
#   # or
#   bash scripts/install-skill.sh

set -e

SKILL_NAME="dida365-cli"
AGENTS_DIR="${HOME}/.agents/skills/${SKILL_NAME}"
CLAUDE_SKILLS_DIR="${HOME}/.claude/skills"

echo "Installing ${SKILL_NAME} agent skill..."

# Determine source directory (local repo or download)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_DIR="$(dirname "$SCRIPT_DIR")"

if [ -f "${REPO_DIR}/skills/${SKILL_NAME}/SKILL.md" ]; then
  # Local install from cloned repo
  SOURCE_DIR="${REPO_DIR}/skills/${SKILL_NAME}"
  echo "  Source: local (${SOURCE_DIR})"
else
  # Download from GitHub
  echo "  Source: GitHub"
  TEMP_DIR=$(mktemp -d)
  trap 'rm -rf "$TEMP_DIR"' EXIT

  GITHUB_RAW="https://raw.githubusercontent.com/YOUR_GITHUB_USERNAME/dida365-ai-tools/main"
  curl -fsSL "${GITHUB_RAW}/skills/${SKILL_NAME}/SKILL.md" -o "${TEMP_DIR}/SKILL.md"
  mkdir -p "${TEMP_DIR}/references"
  curl -fsSL "${GITHUB_RAW}/skills/${SKILL_NAME}/references/dida365-openapi.md" -o "${TEMP_DIR}/references/dida365-openapi.md"
  SOURCE_DIR="${TEMP_DIR}"
fi

# Create target directories
mkdir -p "${AGENTS_DIR}/references"
mkdir -p "${CLAUDE_SKILLS_DIR}"

# Copy files
cp "${SOURCE_DIR}/SKILL.md" "${AGENTS_DIR}/SKILL.md"
cp "${SOURCE_DIR}/references/dida365-openapi.md" "${AGENTS_DIR}/references/dida365-openapi.md"

# Create symlink
if [ -L "${CLAUDE_SKILLS_DIR}/${SKILL_NAME}" ]; then
  rm "${CLAUDE_SKILLS_DIR}/${SKILL_NAME}"
fi
ln -s "../../.agents/skills/${SKILL_NAME}" "${CLAUDE_SKILLS_DIR}/${SKILL_NAME}"

echo ""
echo "Done! Skill '${SKILL_NAME}' installed successfully."
echo "  Skill:   ${AGENTS_DIR}/SKILL.md"
echo "  Symlink: ${CLAUDE_SKILLS_DIR}/${SKILL_NAME}"
echo ""
echo "Restart Claude Code to activate the skill."
