FROM keymetrics/pm2:latest-alpine

LABEL authors="ghazi.triki@riadvice.tn"

ENV TERM="xterm"

# Update headers
RUN apk add --update linux-headers

# Minimal packages
RUN apk update && apk upgrade && apk add --no-cache --virtual .persistent-deps \
     acl \
     bash \
	 curl

COPY ecosystem/config ecosystem/config/
COPY ecosystem/package.json ecosystem/
COPY ecosystem/yarn.lock ecosystem/
COPY ecosystem/ecosystem.config.js ecosystem/

COPY ../hivelvet-frontend/build/installer .

# Install app dependencies
ENV NPM_CONFIG_LOGLEVEL warn
RUN npm install -g yarn
RUN yarn install --production
