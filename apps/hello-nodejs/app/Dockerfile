FROM registry.access.redhat.com/ubi8/nodejs-18:latest

# Set working directory
WORKDIR /opt/app-root/src

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application code
COPY server.js ./

# Expose port
EXPOSE 8080

# Run as non-root user (already set in UBI image)
USER 1001

# Start the application
CMD ["npm", "start"]
