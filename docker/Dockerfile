# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Frontend build stage, produces the static web application.
# ---------------------------------------------------------------------------
FROM node:24-trixie-slim AS frontend

ARG VITE_INSTALLER_FEATURE=false

WORKDIR /app

RUN corepack enable

COPY bbbeasy-frontend/package.json bbbeasy-frontend/yarn.lock bbbeasy-frontend/.yarnrc.yml ./
COPY bbbeasy-frontend/.yarn ./.yarn
RUN yarn install --immutable

COPY bbbeasy-frontend ./
RUN VITE_INSTALLER_FEATURE=${VITE_INSTALLER_FEATURE} GENERATE_SOURCEMAP=false yarn build

# ---------------------------------------------------------------------------
# Backend stage, PHP-FPM serving the Fat-Free/Sukarix application.
# ---------------------------------------------------------------------------
FROM php:8.5-fpm-trixie AS backend

ENV COMPOSER_ALLOW_SUPERUSER=1 \
    COMPOSER_NO_INTERACTION=1

RUN apt-get update && apt-get install -y --no-install-recommends \
        git \
        libicu-dev \
        libpq-dev \
        libzip-dev \
        unzip \
    && docker-php-ext-install bcmath \
    && docker-php-ext-install zip \
    && docker-php-ext-install intl \
    && docker-php-ext-install pgsql \
    && docker-php-ext-install pdo_pgsql \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer

WORKDIR /var/www/html/bbbeasy-backend

COPY bbbeasy-backend/composer.json bbbeasy-backend/composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist --ignore-platform-req=ext-xdebug

COPY bbbeasy-backend ./
RUN composer dump-autoload --optimize --no-dev \
    && mkdir -p logs tmp uploads \
    && chown -R www-data:www-data logs tmp uploads

EXPOSE 9000

CMD ["php-fpm"]

# ---------------------------------------------------------------------------
# Web stage, nginx serving the frontend and proxying the API to PHP-FPM.
# ---------------------------------------------------------------------------
FROM nginx:1.29-alpine AS web

COPY --from=frontend /app/dist /var/www/html/bbbeasy-frontend
COPY bbbeasy-backend/public /var/www/html/bbbeasy-backend/public
COPY docker/bbbeasy.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
