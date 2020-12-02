FROM node:lts-alpine3.10 As builder
WORKDIR /usr/src/app
COPY package*.json ./
COPY . .
RUN npm install
RUN npm run build

FROM node:lts-alpine3.10 As prod
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
WORKDIR /usr/src/app
COPY package*.json ./
COPY . .
RUN npm install --only=production
COPY --from=builder /usr/src/app/dist ./dist
CMD ["npm", "run", "start:prod"]
