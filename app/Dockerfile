FROM node:16

ENV CI=true

WORKDIR /app

COPY package.json ./

RUN npm install -g @nestjs/cli

RUN npm install

COPY ./ ./

RUN chmod 775 pipeline_scripts/annotation_script-1.sh
RUN chmod 775 pipeline_scripts/deleteriousness_script.sh
RUN chmod 775 pipeline_scripts/disgenet_script.R
RUN chmod 775 pipeline_scripts/filter_exonic.R

#install R and packages
RUN apt update
RUN apt-get install -y r-base
RUN apt-get install -y -qq r-cran-ggplot2

#remove windows line endings
RUN apt-get install dos2unix
RUN dos2unix pipeline_scripts/annotation_script-1.sh
RUN dos2unix pipeline_scripts/deleteriousness_script.sh
RUN dos2unix pipeline_scripts/disgenet_script.R
RUN dos2unix pipeline_scripts/filter_exonic.R

RUN npm run build

CMD [ "npm", "run", "start:prod" ]
