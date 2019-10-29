FROM node:8.14-alpine

COPY . /app

WORKDIR /app

RUN npm install --production

ENTRYPOINT ["node", "index.js"]
