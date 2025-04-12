FROM node:23-alpine

# Set working directory
WORKDIR /app

# Copy dependencies first
COPY ../../../frontend/package*.json ./
RUN npm install

# Copy your entire app (adjust if needed)
COPY ../../../frontend ./

# Set default command to run tests
CMD ["npm", "run", "test"]