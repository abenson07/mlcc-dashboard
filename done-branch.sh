#!/bin/bash

# Get current branch name
branch=$(git rev-parse --abbrev-ref HEAD)

if [ "$branch" = "main" ]; then
  echo "You're already on main. Run this from your worktree."
  exit 1
fi

echo "Finishing branch: $branch"
echo ""

# Get the worktree path (current directory)
worktree_path=$(pwd)

# Commit any uncommitted changes?
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "You have uncommitted changes. Commit them first? (y/n)"
  read -r should_commit
  if [ "$should_commit" = "y" ]; then
    echo "Commit message:"
    read -r msg
    git add .
    git commit -m "$msg"
  else
    echo "Cancelled. Commit or stash your changes first."
    exit 1
  fi
fi

# Merge into main
echo "Merging $branch into main..."
git checkout main
git merge "$branch"

# Push to GitHub
echo "Pushing to GitHub..."
git push origin main

echo ""
echo "Delete local worktree and branch '$branch'? (y/n)"
read -r cleanup

if [ "$cleanup" = "y" ]; then
  git worktree remove "$worktree_path"
  git branch -d "$branch"
  echo "Cleaned up."
else
  echo "Kept worktree and branch."
fi

echo ""
echo "Done."
