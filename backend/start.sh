#!/bin/sh
set -e

echo "Running migrations..."
npx typeorm-ts-node-commonjs migration:run -d typeorm.config.ts

echo "Starting application..."
node dist/main
