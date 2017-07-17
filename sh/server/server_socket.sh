#!/bin/bash
#
# forever start socket server by port
# 2017/06/23 
PATH=/bin:/sbin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin:/usr/local/nodejs/node-v6.10.3-linux-x64/bin
export PATH

port=$1||6189

cd /home/yzhou51/workspace/wire_check-dev-yzhou51/socket/
forever stop app.js
PORT_ENV=port DEBUG=*.db,*.modal,*.logic,*.app node app.js
