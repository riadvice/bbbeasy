#!/bin/bash

PHP_FPM_LISTEN=8000

# Change PHP-FPM listen address
sed -i "s/listen = 9000/listen = ${PHP_FPM_LISTEN}/g" /usr/local/etc/php-fpm.d/zz-docker.conf

# Set permissions for the web directory
sed -i '4i \chown -R nginx:nginx /var/www/html && chmod -R 755 /var/www/html' /usr/local/bin/docker-php-entrypoint
sed -i '3i nginx -g '\''daemon on;'\''' /usr/local/bin/docker-php-entrypoint

# Start Nginx
nginx -g 'daemon on;'

# Start PHP-FPM
php vendor/bin/phinx migrate -e production && php-fpm
