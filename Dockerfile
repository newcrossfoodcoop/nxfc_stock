FROM node:0.12

MAINTAINER Ben Simpson, ben@newcrossfoodcoop.org.uk

WORKDIR /home/app

# Install fonts for PhantomJS
RUN apt-get update \
    && apt-get install -y libfontconfig libfreetype6 bzip2 wget git curl\
    && rm -rf /var/lib/apt/lists/*

# Install Mean.JS Prerequisites
RUN npm install -g gulp
RUN npm install -g bower
RUN npm install -g karma
RUN npm install -g phantomjs

ENV NXFC_BASE_VERSION=v4

# Install Mean.JS packages
RUN wget https://raw.githubusercontent.com/newcrossfoodcoop/nxfc/nxfc_base_${NXFC_BASE_VERSION}/package.json
RUN npm install

# Manually trigger bower. Why doesnt this work via npm install?
RUN wget https://raw.githubusercontent.com/newcrossfoodcoop/nxfc/nxfc_base_${NXFC_BASE_VERSION}/.bowerrc
RUN wget https://raw.githubusercontent.com/newcrossfoodcoop/nxfc/nxfc_base_${NXFC_BASE_VERSION}/bower.json
RUN bower install --config.interactive=false --allow-root
