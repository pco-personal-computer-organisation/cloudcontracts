# from https://nodejs.org/en/docs/guides/nodejs-docker-webapp/

FROM node:6

ENV CUSTOMER_ID=0

RUN echo "Europe/Berlin" > /etc/timezone && dpkg-reconfigure -f noninteractive tzdata

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
COPY .bowerrc /usr/src/app
RUN npm install -g bower webpack
#RUN npm install --production
RUN npm install

# Bundle app source
COPY . /usr/src/app

RUN rm -rf storage

# Remove automigration script, as it borks the mysql tables
RUN rm server/boot/y-automigrate.js

# remove unnecessary config files, may add this to .dockerignore
RUN rm server/*.production.json

RUN npm run build

COPY entrypoint.sh /

EXPOSE 3000

CMD [ "sh", "/entrypoint.sh" ]
