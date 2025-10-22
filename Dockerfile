# ---------- 1️⃣ Base build stage ----------
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev)
RUN npm ci --legacy-peer-deps

# Copy rest of the project files
COPY . .

# Build the project (if you have a build script)
# For pure Express apps, you can skip this
RUN npm run build || echo "No build script found, skipping build"

# ---------- 2️⃣ Runtime stage ----------
FROM node:20-alpine AS runner

# Set working directory
WORKDIR /app

# Copy only needed files for runtime
COPY package*.json ./

# Install only production dependencies
RUN npm ci --legacy-peer-deps

# Copy built code and any necessary assets from builder

COPY --from=builder /app/src ./src

# Set environment variables
ENV NODE_ENV=production
EXPOSE 3000

# Start command (adjust if needed)
CMD ["npm", "start"]
