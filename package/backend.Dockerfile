FROM php:8.2.2-fpm-alpine3.17

LABEL authors="ghazi.triki@riadvice.tn,saoussen.boulakbech@riadvice.tn"

ENV TERM="xterm"

# Update headers
RUN apk add --update linux-headers

# Minimal packages
RUN apk update && apk upgrade && apk add --no-cache --virtual .persistent-deps \
     acl \
     bash \
	 curl \
     icu-data-full \
     icu-libs \
	 libpq-dev \
     libxml2-dev \
     openssh-client \
     oniguruma-dev \
     libzip \
     zlib


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
        redis \
        xdebug \
        zip \
    && apk del .build-deps

# Install composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Conf PHP
COPY . /var/www/hivelvet

# Composer
COPY --from=composer /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/hivelvet
RUN composer install -o --no-dev

EXPOSE 9000
CMD ["php-fpm"]
