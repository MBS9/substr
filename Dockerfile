FROM python:3.12-alpine

RUN apk add --no-cache musl-dev rust cargo

COPY rust/ /rust/
RUN cd /rust && pip install .

COPY app/ /app/
RUN pip install --no-cache-dir -r /app/requirements.txt

CMD ["python", "/app/app.py"]

EXPOSE 8080

LABEL org.opencontainers.image.source=https://github.com/mbs9/substr
