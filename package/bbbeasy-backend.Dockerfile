FROM php:8.2.3-fpm-alpine3.17

LABEL authors="ghazi.triki@riadvice.tn,wael.bouslama@riadvice.tn,o.moussi@arribatt.com"

# Environment Variables
ENV TERM="xterm"

# Update headers
RUN apk add --update linux-headers

# Minimal packages
RUN apk update && apk upgrade && apk add --no-cache --virtual .persistent-deps \
     acl \
     bash \
     git \
     curl \
     icu-data-full \
     icu-libs \
     libpq-dev \
     libxml2-dev \
     openssh-client \
     oniguruma-dev \
     libzip \
     zlib \
     nginx

# PHP extensions
RUN set -xe \
    && apk add --no-cache --virtual .build-deps \
        $PHPIZE_DEPS \
        icu-data-full \
        icu-dev \
        libtool \
        openssl-dev \
        zlib-dev \
        zip \
        unzip \
        libzip-dev \
    && pecl install xdebug-3.2.0 \
    && pecl install -o -f redis \
    && docker-php-ext-install \
        bcmath \
        intl \
        pgsql \
        pdo_pgsql \
        mbstring \
        opcache \
        sockets \
        zip \
    && wget https://github.com/FriendsOfPHP/pickle/releases/latest/download/pickle.phar \
    && mv pickle.phar /usr/local/bin/pickle \
    && chmod +x /usr/local/bin/pickle \
    && pickle install uploadprogress \
    && docker-php-ext-enable \
        pgsql \
        pdo_pgsql \
        redis \
        xdebug \
        zip \
    && apk del .build-deps

# Conf PHP
#COPY . /var/www/html
RUN mkdir -p /var/www/html/bbbeasy-backend
COPY bbbeasy-backend/. /var/www/html/bbbeasy-backend


WORKDIR /var/www/html/bbbeasy-backend

# Copy the entrypoint.sh script
COPY package/bbbeasy-backend.entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

#preparing Nginx
RUN rm /etc/nginx/http.d/*
COPY package/ressources/BBBE-BACKEND/config/nginx/bbbe-backend.conf /etc/nginx/http.d/

 
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

EXPOSE 8000
