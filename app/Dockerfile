FROM node:16

ENV CI=true

WORKDIR /app

COPY package.json ./

COPY yarn.lock ./

#RUN yarn add @nestjs/cli --verbose

RUN yarn install

COPY ./ ./

RUN chmod 775 pipeline_scripts/annotation_script-1.sh
RUN chmod 775 pipeline_scripts/disgenet_script.R

#install R and packages
#RUN apt-key adv --keyserver keyserver.ubuntu.com --recv-keys E298A3A825C0D65DFD57CBB651716619E084DAB9
#RUN add-apt-repository 'deb https://cloud.r-project.org/bin/linux/ubuntu focal-cran40/'
RUN apt update
RUN apt-get install -y r-base
RUN R -e "install.packages(c('ggplot2'),dependencies=TRUE,repos='http://cran.rstudio.com/')"

#RUN yarn run build
CMD [ "yarn", "run", "start:dev" ]
