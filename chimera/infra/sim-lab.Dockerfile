# Stage 1: Build/Install
FROM python:3.11-slim AS builder

WORKDIR /app

# Install dependencies
COPY ../apps/sim-lab/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Stage 2: Production
FROM python:3.11-slim AS runner

WORKDIR /app

# Copy dependencies from builder
COPY --from=builder /usr/local/lib/python3.11/site-packages/ /usr/local/lib/python3.11/site-packages/

# Copy source code
COPY ../apps/sim-lab/ .

# Expose port and start the app
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
