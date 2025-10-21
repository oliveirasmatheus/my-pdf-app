#!/bin/bash

# Update package list
apt-get update

# Install LibreOffice
apt-get install -y libreoffice

# Now, start the Node.js backend (use npm start or the relevant start command)
npm start
