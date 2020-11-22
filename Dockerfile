# FROM node:12-slim as Build

# WORKDIR /app

# COPY package*.json ./app/ 
# RUN npm install 
# COPY ./ ./app/

# EXPOSE 3000

# CMD "node ./src/server/server.js"

FROM node:12-alpine
WORKDIR /src
COPY package.json package-lock.json /src/
RUN npm install --production
COPY . /src
EXPOSE 3000
RUN npm config set unsafe-perm true
RUN npm install -g nodemon
# CMD ["npm", "start"]

ENTRYPOINT ["nodemon", "./src/server/server.js"]