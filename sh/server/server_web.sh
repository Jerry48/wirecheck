#!/bin/bash
#
# start web server by port
# 2017/06/23 
PATH=/bin:/sbin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin:/usr/local/nodejs/node-v6.10.3-linux-x64/bin
export PATH

port=$1||6178

cd /home/yzhou51/workspace/wire_check-dev-yzhou51/back/
forever stop testapp.js
PORT_ENV=$port DEBUG=*.db,*.modal,*.logic,*.app,*.utils node testapp.js
