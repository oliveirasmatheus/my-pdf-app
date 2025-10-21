# Use the libreoffice image
FROM libreoffice/online:latest

# Ensure we run as root to install packages
USER root

# Install dependencies and upgrade Node.js to a more recent version
RUN apt-get update && apt-get install -y \
    curl \
    gnupg2 \
    lsb-release \
    ca-certificates

# Install Node.js 16 from NodeSource (compatible with npm@latest)
RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash - && \
    apt-get install -y nodejs

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
