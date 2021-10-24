FROM node:16-alpine AS build
ARG VUE_APP_DISCORD_TAG=Zikeji#9453
ARG VUE_APP_MATAMO_URL=
ARG VUE_APP_MATAMO_SITEID=
ARG VUE_APP_MATAMO_FILE=
ARG VUE_APP_NWDB_RECIPEURL=
ARG VUE_APP_RECAPTCHA_SITEKEY=
ARG VUE_APP_FEEDBACKURL=
WORKDIR /usr/src/app
COPY babel.config.js ./
COPY package-lock.json ./
COPY package.json ./
COPY vue.config.js ./
COPY ./src ./src
COPY ./public ./public
RUN npm ci
RUN npm run build

FROM nginx:alpine
WORKDIR /usr/share/nginx/html
COPY --from=build /usr/src/app/dist ./
EXPOSE 80