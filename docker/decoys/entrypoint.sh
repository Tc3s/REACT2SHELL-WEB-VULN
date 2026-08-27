#!/bin/sh
python3 /app/ftp_decoy.py &
python3 /app/ssh_decoy.py &
wait -n
