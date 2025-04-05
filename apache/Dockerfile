FROM rockylinux:9

# Get the Shibboleth repo
RUN curl -X POST -d "platform=rockylinux9" https://shibboleth.net/cgi-bin/sp_repo.cgi > /etc/yum.repos.d/shibboleth.repo

# Install Apache and Shibboleth
RUN dnf -y update && dnf -y install \
    httpd \
    httpd-tools \
    mod_ssl \
    shibboleth \
    && dnf clean all

# Enable necessary apache modules
RUN sed -i '/^#LoadModule proxy_module/ s/^#//' /etc/httpd/conf/httpd.conf \
    && sed -i '/^#LoadModule proxy_http_module/ s/^#//' /etc/httpd/conf/httpd.conf \
    && sed -i '/^#LoadModule ssl_module/ s/^#//' /etc/httpd/conf/httpd.conf \
    && sed -i '/^#LoadModule rewrite_module/ s/^#//' /etc/httpd/conf/httpd.conf

# Disable default SSL configuration
RUN mv /etc/httpd/conf.d/ssl.conf /etc/httpd/conf.d/ssl.conf.disabled

# Copy custom reverse proxy configuration
COPY ./reverse-proxy.conf /etc/httpd/conf.d/

# Generate shibboleth keys
RUN pushd /etc/shibboleth && ./keygen.sh && popd

EXPOSE 80 443
CMD ["httpd", "-D", "FOREGROUND"]