FROM mhart/alpine-node:4.5

MAINTAINER Ben Simpson, ben@newcrossfoodcoop.org.uk

RUN apk update
RUN apk add git
RUN rm -r /var/cache/apk

WORKDIR /home/app

RUN npm install -g gulp

ADD package.json /home/app/package.json
RUN npm install

ADD gulpfile.js /home/app/gulpfile.js

CMD ["gulp"]
