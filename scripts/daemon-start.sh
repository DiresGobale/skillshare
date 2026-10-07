#!/bin/bash
# Double-fork daemon pattern to fully detach from controlling terminal
cd /home/z/my-project

# Redirect all I/O away from terminal
exec </dev/null >>/home/z/my-project/dev.log 2>&1

# First fork: parent exits, child becomes orphan
(
  # Child: create new session with setsid
  setsid npx next dev -p 3000 &
  # Capture the grandchild PID
  GPID=$!
  # Save it
  echo $GPID > /tmp/nextserver.pid
  # Exit child immediately, leaving grandchild orphaned but alive
  exit 0
) &
# Wait for child to fork
wait
