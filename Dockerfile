FROM node:4-onbuild

ADD test.sh /

RUN mkdir /app

WORKDIR /app

ADD package.json .

ENTRYPOINT [ "/test.sh" ]
