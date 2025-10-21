#!/bin/bash

echo "This script is intentionally a no-op in CI."
echo "When deploying to a Docker-capable host, use the provided Dockerfile in backend/Dockerfile which installs LibreOffice." 
echo "For local development on Debian/Ubuntu you can run: sudo apt-get update && sudo apt-get install -y libreoffice"

exit 0
