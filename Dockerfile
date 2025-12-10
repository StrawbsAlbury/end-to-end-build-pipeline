FROM node:20-alpine

WORKDIR /usr/src/app

# Install deps
COPY app/package*.json ./
RUN npm install --only=production

# Copy app code
COPY app/. .

ENV PORT=3000
EXPOSE 3000

CMD ["npm", "start"]
