FROM alpine:3.17

LABEL authors="ghazi.triki@riadvice.tn"

ENV TERM="xterm"

# Update headers
RUN apk add --update linux-headers

# Minimal packages
RUN apk update && apk upgrade && apk add --no-cache --virtual .persistent-deps \
     acl \
     bash \
	 curl

COPY /dist /var/www/hivelvet-webapp
