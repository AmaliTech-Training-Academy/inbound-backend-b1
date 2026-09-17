FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npx prisma validate --schema=./src/api/v1/prisma/schema.prisma
RUN npx prisma generate

EXPOSE 9001

CMD ["npm", "start"]