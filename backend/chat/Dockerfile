FROM node:20-alpine


WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3004

CMD ["npx", "concurrently", "node src/server.js", "node src/jobs/message.worker.js"]