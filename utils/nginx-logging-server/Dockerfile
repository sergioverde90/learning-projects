# Usa la imagen oficial de Nginx
FROM nginx:alpine

# Copia el archivo de configuración nginx.conf a la ubicación correcta
COPY conf/nginx.conf /etc/nginx/nginx.conf

# Crea los archivos de log y asigna permisos
RUN touch /var/log/nginx/tcp_access.log /var/log/nginx/udp_access.log && \
    chown nginx:nginx /var/log/nginx/tcp_access.log /var/log/nginx/udp_access.log

# Expone los puertos para el tráfico TCP y UDP
EXPOSE 12345 12346/udp

# Comando para ejecutar Nginx en primer plano
CMD ["nginx", "-g", "daemon off;"]