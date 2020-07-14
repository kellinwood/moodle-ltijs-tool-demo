FROM node:12

RUN apt install bash

EXPOSE 3000

WORKDIR /app

ADD package.json package-lock.json ./

ADD index.js ./

ADD public ./public

RUN npm install

ENV DB_HOST=localhost
ENV DB_DATABASE=ltimoodle
ENV LTI_KEY=LTI_KEY
ENV MOODLE_URL=http://localhost/moodle
ENV DEBUG=provider:*

ENTRYPOINT [ "node", "index.js" ]



