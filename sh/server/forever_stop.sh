#!/bin/bash
#
# forever stop servers, including socket, wechat ,web
# 2017/06/23 
PATH=/bin:/sbin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin:/usr/local/nodejs/node-v6.10.3-linux-x64/bin
export PATH

cd /home/yzhou51/workspace/wire_check-dev-yzhou51/socket2
forever stop app.js

cd /home/yzhou51/workspace/wire_check-dev-yzhou51/wechat
forever stop app.js

cd /home/yzhou51/workspace/wire_check-dev-yzhou51/back
forever stop testapp.js

