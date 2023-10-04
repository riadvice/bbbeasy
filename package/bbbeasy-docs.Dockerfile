FROM nginx:latest

LABEL authors="ghazi.triki@riadvice.tn,wael.bouslama@riadvice.tn,o.moussi@arribatt.com"

RUN mkdir -p /var/www/html/bbbeasy-docs/build
COPY bbbeasy-docs/build/. /var/www/html/bbbeasy-docs/build/

WORKDIR /var/www/html/bbbeasy-docs

#Configure Nginx 
RUN rm /etc/nginx/conf.d/default.conf
COPY package/ressources/BBBE-DOCS/config/bbbe-docs.conf /etc/nginx/conf.d/

#Permission for webapp folder
RUN chown -R nginx: /var/www/html/

CMD ["nginx", "-g", "daemon off;"]
