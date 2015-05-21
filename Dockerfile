FROM node:0.12

MAINTAINER Ben Simpson, ben@newcrossfoodcoop.org.uk

WORKDIR /home/app

# Install fonts for PhantomJS
RUN apt-get update \
    && apt-get install -y libfontconfig libfreetype6 \
    && rm -rf /var/lib/apt/lists/*

# Install Mean.JS Prerequisites
RUN npm install -g gulp
RUN npm install -g bower

# Install Mean.JS packages
RUN wget https://raw.githubusercontent.com/newcrossfoodcoop/nxfc/nxfc_base_v2/package.json
RUN npm install

# Manually trigger bower. Why doesnt this work via npm install?
RUN wget https://raw.githubusercontent.com/newcrossfoodcoop/nxfc/nxfc_base_v3/.bowerrc
RUN wget https://raw.githubusercontent.com/newcrossfoodcoop/nxfc/nxfc_base_v3/bower.json
RUN bower install --config.interactive=false --allow-root
