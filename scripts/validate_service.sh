#!/bin/bash
# Check if the service is running
sleep 10
curl -f http://localhost:8080/health || exit 1