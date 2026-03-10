#!/bin/bash

echo "What are you working on?"
read -r description

# Slugify: lowercase, replace spaces with hyphens, remove special chars
slug=$(echo "$description" | tr '[:upper:]' '[:lower:]' | sed 's/ /-/g' | sed 's/[^a-z0-9-]//g')

echo ""
echo "Branch name: $slug"
echo "Confirm? (y/n)"
read -r confirm

if [ "$confirm" != "y" ]; then
  echo "Cancelled."
  exit 0
fi

# Get the repo root
repo_root=$(git rev-parse --show-toplevel)
parent_dir=$(dirname "$repo_root")
worktree_path="$parent_dir/$slug"

git worktree add -b "$slug" "$worktree_path"

echo ""
echo "Opening in Cursor..."
cursor "$worktree_path"
