# Backend deployment with Docker

This backend requires LibreOffice for DOCX -> PDF conversion. Render's build environment does not allow running `apt-get` during their build phase, so the easiest, most reliable approach is to deploy the backend as a Docker service (Render: "Docker" or any container platform).

Quick steps (Render):
1. In Render, create a new "Web Service" and point it at this repo and the `backend/` folder.
2. Choose "Docker" as the environment. Render will build the `backend/Dockerfile`.
3. Set the service's port to `10000` (the Dockerfile exposes 10000 and `index.js` uses that by default).

Local testing (with Docker):

Build image:

```bash
# from repository root
cd backend
docker build -t my-pdf-backend:local .
```

Run container (bind port 10000):

```bash
docker run --rm -p 10000:10000 -e PORT=10000 my-pdf-backend:local
```

Notes
- If you prefer not to use Docker and want to install LibreOffice directly on the host, install LibreOffice manually before starting the backend.
- The `install-libreoffice.sh` script in the `backend/` folder is now a no-op to avoid CI failures on platforms that don't allow apt during builds.
