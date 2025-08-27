#!/bin/bash
cd /var/app/current

# Install Node.js 20
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs

# Install dependencies
npm ci

# Generate Prisma client
npx prisma generate

# Build the application
npm run build