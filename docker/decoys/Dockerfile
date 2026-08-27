FROM python:3.11-alpine
WORKDIR /app
COPY ftp_decoy.py ssh_decoy.py entrypoint.sh ./
EXPOSE 21 2222
CMD ["/app/entrypoint.sh"]
