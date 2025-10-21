# Use the libreoffice image
FROM libreoffice/online:latest

# Ensure we run as root to install packages
USER root

# Set up Node environment on top of the LibreOffice image
RUN apt-get update && apt-get install -y nodejs npm

# Upgrade npm to the latest version
RUN npm install -g npm@latest

# Set working directory for the app
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./

# Run npm ci (since we upgraded npm to a newer version)
RUN npm ci --production

# Copy the rest of the backend files
COPY . .

# Expose the desired port
EXPOSE 10000
ENV PORT=10000

# Start the app
CMD ["node", "index.js"]
