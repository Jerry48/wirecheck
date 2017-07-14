# !/bin/sh
mysqladmin create wirecheck
cd /home/yzhou51/workspace/backup
mysql -uroot -pkooling123 wirecheck < backup.sql
