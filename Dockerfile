ARG NODE_VERSION
FROM node:${NODE_VERSION}
ARG NODE_PRE_GYP_GITHUB_TOKEN
ENV NODE_PRE_GYP_GITHUB_TOKEN=$NODE_PRE_GYP_GITHUB_TOKEN
WORKDIR /app
COPY . .
RUN script/download-libs.sh
RUN npm install --build-from-source
RUN npm run build
RUN npm test
RUN ./node_modules/.bin/node-pre-gyp rebuild
RUN ./node_modules/.bin/node-pre-gyp package
RUN ./node_modules/.bin/node-pre-gyp-github publish

