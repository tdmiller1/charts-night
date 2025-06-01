# Use official Node.js LTS image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if present)
COPY package.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the project files
COPY . .

# Expose the port your ws-server.js listens on (default 8080, change if needed)
EXPOSE 8080

# Start the WebSocket server
CMD ["node", "ws-server.js"]
