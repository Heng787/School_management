#!/bin/bash

# Simple check for Vite dev server or Nginx production
if curl -s -f http://localhost:5173 > /dev/null || curl -s -f http://localhost:80 > /dev/null; then
  echo "Frontend service is healthy."
  exit 0
else
  echo "Frontend service health check failed."
  exit 1
fi
