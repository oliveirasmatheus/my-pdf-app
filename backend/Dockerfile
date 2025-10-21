# Use a prebuilt LibreOffice image as the base
FROM libreoffice/online:latest

# Set up Node environment on top of the LibreOffice image
RUN apt-get update && apt-get install -y nodejs npm

# Set working directory for the app
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --production

# Copy rest of the backend files
COPY . .

# Expose the desired port
EXPOSE 10000
ENV PORT=10000

# Start the app
CMD ["node", "index.js"]
