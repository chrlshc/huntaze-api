#!/bin/bash
# Stop the application if running
pm2 stop huntaze-api || true
pm2 delete huntaze-api || true