FROM node:4

RUN apt-get update -y && \
  apt-get install -y vim git curl

RUN mkdir /app

WORKDIR /app

ADD package.json .

RUN npm install

ADD test.sh /

ENTRYPOINT [ "/test.sh" ]
