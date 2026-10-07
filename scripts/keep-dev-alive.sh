#!/bin/bash
# Keep the dev server alive - restart if it dies
cd /home/z/my-project
while true; do
  echo "[$(date)] Starting dev server..."
  npx next dev -p 3000 > dev.log 2>&1
  EXIT_CODE=$?
  echo "[$(date)] Dev server exited with code $EXIT_CODE. Restarting in 3s..."
  sleep 3
done
