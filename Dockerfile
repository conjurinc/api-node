FROM node:4

RUN apt-get update -y && \
  apt-get install -y vim git curl

RUN mkdir /app

WORKDIR /app

ADD package.json .

RUN npm install

ENV NODE_PATH /app

ADD test.sh /

ENTRYPOINT [ "/test.sh" ]
