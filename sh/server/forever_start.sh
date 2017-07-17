#!/bin/bash
#
# forever start servers, including socket, wechat ,web
# 2017/06/23 
PATH=/bin:/sbin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin:/usr/local/nodejs/node-v6.10.3-linux-x64/bin
export PATH

cd /home/yzhou51/workspace/wire_check-dev-yzhou51/socket
forever stop app.js
forever start -l /home/yzhou51/workspace/log/socket.log -e /home/yzhou51/workspace/log/err/socket.err -a app.js

cd /home/yzhou51/workspace/wire_check-dev-yzhou51/wechat
forever stop app.js
forever start -l /home/yzhou51/workspace/log/wechat.log -e /home/yzhou51/workspace/log/err/wechat.err -a app.js

cd /home/yzhou51/workspace/wire_check-dev-yzhou51/back
forever stop testapp.js
forever start -l /home/yzhou51/workspace/log/web.log -e /home/yzhou51/workspace/log/err/web.err -a testapp.js


