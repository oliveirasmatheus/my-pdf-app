# Use the official Ubuntu image as a base
FROM ubuntu:20.04

# Set non-interactive mode to avoid prompts during build
ENV DEBIAN_FRONTEND=noninteractive

# Update apt-get and install dependencies
RUN apt-get update && apt-get install -y \
    curl \
    gnupg2 \
    lsb-release \
    ca-certificates \
    libreoffice

# Install Node.js 16 (already comes with npm)
RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash - && \
    apt-get install -y nodejs

# Set working directory for the app
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --production

# Copy the rest of the backend files
COPY . .

# Expose the desired port
EXPOSE 10000
ENV PORT=10000

# Start the app
CMD ["node", "index.js"]
