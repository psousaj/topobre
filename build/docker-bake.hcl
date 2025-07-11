group "default" {
  targets = ["api", "web", "worker"]
}

target "api" {
  context = "."
  dockerfile = "apps/api/Dockerfile"
  tags = [
    "ghcr.io/psousaj/topobre-api:latest",
    "ghcr.io/psousaj/topobre-api:${TAG}"
  ]
}

target "web" {
  context = "."
  dockerfile = "apps/web/Dockerfile"
  tags = [
    "ghcr.io/psousaj/topobre-web:latest",
    "ghcr.io/psousaj/topobre-web:${TAG}"
  ]
}

target "worker" {
  context = "."
  dockerfile = "apps/worker/Dockerfile"
  tags = [
    "ghcr.io/psousaj/topobre-worker:latest",
    "ghcr.io/psousaj/topobre-worker:${TAG}"
  ]
}
