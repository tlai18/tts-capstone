FROM httpd:alpine

RUN apk update && apk add --no-cache \
    apache2-utils \
    openssl \
    && rm -rf /var/cache/apk/*

RUN sed -i '/^#LoadModule proxy_module/ s/^#//' /usr/local/apache2/conf/httpd.conf \
    && sed -i '/^#LoadModule proxy_http_module/ s/^#//' /usr/local/apache2/conf/httpd.conf \
    && sed -i '/^#LoadModule ssl_module/ s/^#//' /usr/local/apache2/conf/httpd.conf \
    && sed -i '/^#LoadModule rewrite_module/ s/^#//' /usr/local/apache2/conf/httpd.conf
    
COPY ./reverse-proxy.conf /usr/local/apache2/conf/extra/

RUN echo "Include conf/extra/reverse-proxy.conf" >> /usr/local/apache2/conf/httpd.conf

EXPOSE 80 443

CMD ["httpd", "-D", "FOREGROUND"]
