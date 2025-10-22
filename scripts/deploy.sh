#!/usr/bin/env bash
set -euo pipefail
IMAGE="${IMAGE:-node-express-devops-sample:local}"
docker build -t "$IMAGE" .
docker run --rm -p 3000:3000 -e NODE_ENV=production "$IMAGE"
