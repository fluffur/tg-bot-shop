ARG NODE_VERSION=18.0.0

FROM node:${NODE_VERSION}-alpine

CMD npm run start
