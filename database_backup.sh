# backup.sh

# !bin/bash
cd /home/yzhou51/workspace/backup
echo "You are in backup dir"
rm -f backup.sql
mysqldump -uroot -pkooling123 wirecheck > backup.sql

cd old
File="backup_`date +%Y%m%d%H%M%S`.sql"
mysqldump -uroot -pkooling123 wirecheck > $File
echo "Your database backup successfully completed"
