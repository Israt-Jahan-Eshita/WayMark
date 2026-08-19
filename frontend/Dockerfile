FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build the Next.js application
RUN npm run build

# Start the application
CMD ["npm", "run", "start"]
