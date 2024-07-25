FROM node:22-alpine3.19

LABEL maintainer="gurrrrrrett3 <gart@gart.sh>"
LABEL version="1.0"
LABEL description="a simple file hosting server for oraxen"

WORKDIR /app
COPY . /app

RUN npm install
RUN npm run build

CMD ["npm", "run", "start"]

# docker build -t polymath-ts .