#!/bin/sh
set -e

echo "Running migrations..."
npx typeorm-ts-node-commonjs migration:run -d dist/typeorm.config.js

echo "Starting application..."
node dist/src/main.js