FROM node:12-alpine

COPY package.json /tmp/package.json
RUN cd /tmp && npm install
RUN npm install -g nodemon
RUN mkdir -p /opt/app && cp -a /tmp/node_modules /opt/app/

WORKDIR /opt/app
COPY . /opt/app
 
EXPOSE 3000
# RUN npm config set unsafe-perm true
# # CMD ["npm", "start"]

ENTRYPOINT ["nodemon", "./src/server/server.js"]