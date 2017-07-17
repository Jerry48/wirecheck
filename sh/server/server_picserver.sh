#!/bin/bash
#
# forever start pic servers
# 2017/06/23 
PATH=/bin:/sbin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin:/usr/local/nodejs/node-v6.10.3-linux-x64/bin
export PATH

cd /home/yzhou51/workspace/wire_check-dev-yzhou51/picserver/
forever stop server.js
PORT_ENV=9090 DEBUG=*.db,*.modal,*.logic,*.app node server.js
