FROM newcrossfoodcoop/nxfc_base:latest

MAINTAINER Ben Simpson, ben@newcrossfoodcoop.org.uk

# This definition is primarily used for local docker and docker-compose builds

WORKDIR /home/app

ADD package.json /home/app/package.json
ADD node_modules /home/app/node_modules

RUN npm rebuild
RUN npm install

ADD . /home/app/

CMD ["gulp"]
