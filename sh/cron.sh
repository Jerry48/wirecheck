#!/bin/bash
cd /home/yzhou51/workspace/wire_check-dev-yzhou51/refpic
/usr/local/bin/python parse\&analyze2.py &
source /etc/profile
cd /home/yzhou51/workspace/wire_check-dev-yzhou51/back
/usr/local/nodejs/node-v6.10.3-linux-x64/bin/node check_online.js
