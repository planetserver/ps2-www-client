PHP redirect to Petascope service and cache the result only in PNG
Author: Bang Pham Huu - mailto: b.phamhuu@jacobs-university.de
Disable selinux to redirect to other IP address if not localhost.

Dependency on Centos: sudo yum install php-pecl-memcache memcached
Restart services: sudo systemctl restart memcached
              sudo systemctl restart httpd
Verify memcache is working: php -m | grep memcache

Create log file: sudo touch cached.log in /var/www/html
Change permission to 777: sudo chmod 777 /var/www/html/php/cached.log

Increase memcache file size to 10 MB
sudo gedit /usr/lib/systemd/system/memcached.service
change to 
ExecStart=/usr/bin/memcached -u $USER -p $PORT -m $CACHESIZE -I $MAXITEMSIZE -c $MAXCONN $OPTIONS 
and add MAXITEMSIZE="10m" into /etc/sysconfig/memcached 
then change the maximum cache size to 10 GB
CACHESIZE="10000"
and restart memcached
Verify memcached is working with new maximum size
ps aux | grep memcached (/usr/bin/memcached -u memcached -p 11211 -m 100 -I 10 ...)

Memcache status
memcached-tool 127.0.0.1:11211 stats 
