# Use a stable Node image based on Debian so we can apt-get LibreOffice
FROM node:22-bullseye-slim

# Install LibreOffice and basic fonts. Keep image small and clean up apt lists.
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    libreoffice-writer \
    libreoffice-common \
    libreoffice-core \
    fonts-dejavu-core \
  && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /usr/src/app

# Install production dependencies
COPY package*.json ./
RUN npm ci --production

# Copy rest of backend
COPY . .

# Use the same port the app expects (default in your index.js was 10000)
EXPOSE 10000
ENV PORT=10000

# Start the server
CMD ["node", "index.js"]
