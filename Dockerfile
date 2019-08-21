FROM node:10

RUN apt-get update && \
    apt-get upgrade -y

WORKDIR /app

COPY ./package.json .
COPY ./package-lock.json .

RUN npm install

COPY . .

EXPOSE 7777
