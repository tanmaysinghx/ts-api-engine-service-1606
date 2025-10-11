# Dockerfile
FROM node:20-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies (production-only, to reduce image size)
RUN npm install

# Copy the rest of your application code
COPY . .

# Expose the application port
EXPOSE 1606

# Start the application
CMD ["npm", "run", "prod"]
