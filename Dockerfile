FROM node:18-alpine3.14

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install

COPY . ./

RUN yarn build

CMD [ "yarn", "start:docker" ]
