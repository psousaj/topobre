group "default" {
  targets = ["api", "web", "worker"]
}

target "api" {
  context = "."
  dockerfile = "apps/api/Dockerfile"
  tags = [
    "ghcr.io/psousaj/topobre-api:latest",
  ]
}

target "web" {
  context = "."
  dockerfile = "apps/web/Dockerfile"
  tags = [
    "ghcr.io/psousaj/topobre-web:latest",
  ]
}

target "worker" {
  context = "."
  dockerfile = "apps/worker/Dockerfile"
  tags = [
    "ghcr.io/psousaj/topobre-worker:latest",
  ]
}
