#!/bin/bash
set -e

echo "Setting up School Administration System..."

# Create .env from example if it doesn't exist
if [ ! -f .env ]; then
    cp .env.example .env
    echo "Created .env from .env.example. Please fill in the required values."
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Start local services
echo "Starting local services..."
docker-compose up -d

echo "Setup complete. You can also run 'npm run dev' to start the Vite development server."
