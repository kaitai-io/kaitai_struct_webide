FROM node:14-alpine

WORKDIR /app

RUN apk update \
  && apk add git \
  && git clone --recursive https://github.com/kaitai-io/kaitai_struct_webide /app \
  && npm install \
  && ./build \
  && npm install -g node-static \
  && apk del --purge git

EXPOSE 8000

CMD static /app/out -p 8000 -a 0.0.0.0
