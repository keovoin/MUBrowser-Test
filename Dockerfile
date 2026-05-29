# MU Online Browser Edition - Fly.io image
# Tiny, zero-dependency Node image. The server serves docs/ and the online APIs.
FROM node:20-alpine

WORKDIR /app

# Only the server + the static game are needed (no npm install: zero deps).
COPY server.js ./
COPY docs ./docs

# Persisted data (accounts, characters) lives on a mounted Fly volume at /data.
ENV DATA_DIR=/data
ENV PORT=8080
EXPOSE 8080

# Run as the built-in non-root user
USER node

CMD ["node", "server.js"]
