FROM node:14.16.1-alpine3.12

ENV CI=true

WORKDIR /app

COPY package.json ./

COPY yarn.lock ./

#RUN yarn add @nestjs/cli --verbose

RUN yarn install

COPY ./ ./

#RUN yarn run build

CMD [ "yarn", "run", "start:dev" ]
