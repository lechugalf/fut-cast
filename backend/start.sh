#!/bin/sh
set -e

echo "Running migrations..."
npx typeorm-ts-node-commonjs migration:run -d dist/src/typeorm.config.ts

echo "Starting application..."
node dist/main
