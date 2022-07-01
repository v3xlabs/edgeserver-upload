#!/bin/sh
echo "Pre-commit actions"
pnpm run build
git add lib
