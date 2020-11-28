FROM node:12-alpine

COPY package.json /tmp/package.json
RUN cd /tmp && npm install
RUN npm install -g nodemon
RUN mkdir -p /opt/app && cp -a /tmp/node_modules /opt/app/

WORKDIR /opt/app
COPY . /opt/app
 
EXPOSE 3000

ENTRYPOINT ["npm", "start"]