FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN mkdir -p uploads && chown -R node:node /app

# Drop root — run as the built-in non-privileged 'node' user
USER node

EXPOSE 5000

CMD ["npm", "start"]
