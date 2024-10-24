# Use appropriate base image for Node.js, since this service is a Node.js app
FROM node:14

# Set the working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install

# Copy the application code
COPY . .

# Expose the service on the required port
EXPOSE 5002

# Start the application
CMD ["node", "src/app.js"]
