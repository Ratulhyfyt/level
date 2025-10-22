

- **Level 1**
  - Code repository structure (this folder).
  - **CI** via GitHub Actions (`.github/workflows/ci.yml`) and an optional **Jenkinsfile**.
  - **Build server**: CI builds & lints code; also builds a Docker image.
  - **Test server**: `docker-compose` service `app_test` runs tests and the app on port **3001**.
  - **Production server**: `docker-compose` service `app_prod` runs the app on port **3000**.
  - **Health check** endpoint: `/health`.
  - **Dockerfile** to containerize the app.
- **Level 2**
  - **Instrumentation** on the production server using `prom-client`:
    - Default process metrics (CPU, memory, event loop lag).
    - Custom histogram `http_request_duration_seconds`.
    - **/metrics** endpoint exposes Prometheus-compatible metrics.

## Quick start

### Run locally
```bash
npm ci
npm start
# App on http://localhost:3000
```

### With Docker Compose (test + prod)
```bash
docker compose up --build
# Test env:  http://localhost:3001
# Prod env:  http://localhost:3000
# Metrics:   http://localhost:3000/metrics
# Health:    http://localhost:3000/health
```

### Run tests
```bash
npm ci
npm test
```

## CI (GitHub Actions)
- On push / PR to `main`:
  1. Install deps
  2. Lint
  3. Run tests
  4. Build Docker image

To also push the image, add steps with your registry credentials as secrets.

## Tool Justification
- **GitHub Actions**: simple, free for public repos, integrates with GitHub, easy YAML.
- **Docker + Compose**: portable environments for **test** and **production**, parity across machines.
- **prom-client**: de-facto Prometheus client for Node.js, easy to expose `/metrics`.

## Endpoints
- `GET /` – greeting JSON
- `GET /health` – returns `{ status: "ok" }`
- `GET /metrics` – Prometheus metrics (Level 2)

## Deploying to a server (example)
1. Copy repo to server with Docker installed.
2. Run `docker compose up -d --build app_prod`.
3. Put a reverse proxy (nginx) in front if needed.

## Notes
- For Jenkins, the `Jenkinsfile` mirrors the CI steps.
- For AWS, run the container on ECS/Fargate or EC2 with Docker; point a load balancer to port 3000.

---
## CI/CD publishing options

### Option A: Publish to GitHub Container Registry (GHCR)
Workflow: `.github/workflows/docker-publish-ghCR.yml`

**Secrets/Permissions**
- No extra secrets needed. The built-in `GITHUB_TOKEN` is used.
- Ensure repo **Permissions → Packages: Read/Write** for Actions.
- Images are tagged with the short SHA on pushes, and `latest` + release tag on releases.

**Usage**
- Push to `main` → image `ghcr.io/<owner>/<repo>:<sha>`
- Create a GitHub Release → image `ghcr.io/<owner>/<repo>:<tag>` and `:latest`

### Option B: Push to AWS ECR and deploy to ECS Fargate
Workflow: `.github/workflows/ecr-ecs-deploy.yml`

**Set repository variables (Settings → Variables → Actions → Repository variables)**
- `AWS_REGION` (e.g., `us-east-1`)
- `ECR_REPOSITORY` (e.g., `node-express-devops-sample`)
- `ECS_CLUSTER` (your ECS cluster name)
- `ECS_SERVICE` (your ECS service name)

**Set repository secrets (Settings → Secrets → Actions)**
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

**One-time AWS setup**
1. Create an ECR repo named `${ECR_REPOSITORY}`.
2. Create an ECS cluster & Fargate service (ALB to port 3000).
3. Create **task execution role** with the managed policy `AmazonECSTaskExecutionRolePolicy` and plug its ARN into `ecs/taskdef.json` (`executionRoleArn`). Optionally set a dedicated task role in `taskRoleArn`.
4. Update the task definition `ecs/taskdef.json` if you need different CPU/memory.
5. Ensure the service security group allows inbound 80/443 from the ALB.

**Deploy**
- Push to `main` or click **Run workflow** on *Deploy to AWS ECS*.
- The workflow:
  1) Builds & pushes the image to ECR
  2) Renders task definition with the new image
  3) Updates your ECS service and waits for stability

### Notes
- Prometheus metrics are available at `/metrics`. For production monitoring, point your Prometheus server at the service endpoint, or scrape via the ALB with a rule.
- For HTTPS, terminate TLS on the ALB or your reverse proxy.
# level1_level2
# level1_level2
# level
# level
# level
