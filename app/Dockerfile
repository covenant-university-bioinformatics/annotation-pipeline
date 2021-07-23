FROM node:16

ENV CI=true

WORKDIR /app

COPY package.json ./

COPY yarn.lock ./

#RUN yarn add @nestjs/cli --verbose

RUN yarn install

COPY ./ ./

RUN chmod 775 annotation_script-1.sh

#RUN yarn run build

CMD [ "yarn", "run", "start:dev" ]
