#!/bin/bash
#
# forever start wechat server
# 2017/06/23 
PATH=/bin:/sbin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin:/usr/local/nodejs/node-v6.10.3-linux-x64/bin
export PATH

cd /home/yzhou51/workspace/wire_check-dev-yzhou51/wechat/
forever stop app.js
PORT_ENV=80 DEBUG=*.db,*.modal,*.logic,*.app node app.js
