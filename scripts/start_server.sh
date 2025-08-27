#!/bin/bash
cd /var/app/current

# Run database migrations
npx prisma db push

# Start the application with PM2
npm install -g pm2
pm2 start dist/server.js --name huntaze-api -i max
pm2 save
pm2 startup systemd -u ec2-user --hp /home/ec2-user