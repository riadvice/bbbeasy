FROM nginx:latest

LABEL authors="ghazi.triki@riadvice.tn,wael.bouslama@riadvice.tn,o.moussi@arribatt.com"

RUN mkdir -p /var/www/html/bbbeasy-frontend/build
COPY bbbeasy-frontend/build/. /var/www/html/bbbeasy-frontend/build/
COPY bbbeasy-frontend/.env /var/www/html/bbbeasy-frontend/

WORKDIR /var/www/html/bbbeasy-frontend

#Linking Frontend and Backend
RUN sed -i 's#REACT_APP_API_URL=http://bbbeasy\.test/api#REACT_APP_API_URL=http://bbbeasy_app/api#' .env
RUN sed -i 's#REACT_APP_URL=http://bbbeasy\.test:3300#REACT_APP_URL=http://bbbeasy-frontend_app#' .env

#Permission for installer folder and webapp
RUN chown -R nginx: /var/www/html

#Configure Nginx 
COPY package/ressources/BBBE-FRONTEND/config/bbbe-frontend.conf /etc/nginx/conf.d/
RUN rm /etc/nginx/conf.d/default.conf


CMD ["nginx", "-g", "daemon off; load_module modules/ngx_http_js_module.so;"]
