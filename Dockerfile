FROM node:17

WORKDIR /webide
ADD . .
RUN npm install

CMD node serve.js --compile
