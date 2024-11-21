# Create deployment for URL shortener
resource "kubernetes_deployment" "url_shortener" {
  metadata {
    name      = "url-shortener"
    namespace = kubernetes_namespace.url_shortener.metadata[0].name
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        app = "url-shortener"
      }
    }

    template {
      metadata {
        labels = {
          app = "url-shortener"
        }
      }

      spec {
        container {
          name  = "url-shortener"
          image = "url-shortener:local"

          port {
            container_port = var.url_service_port
          }

          env {
            name  = "NODE_ENV"
            value = var.node_env
          }

          env {
            name  = "DATABASE_URL_URL"
            value = var.database_url_url
          }

          env {
            name  = "URL_SERVICE_URL"
            value = var.url_service_url
          }

          liveness_probe {
            http_get {
              path = "/api/health"
              port = var.url_service_port
            }
            initial_delay_seconds = 40
            period_seconds        = 30
            timeout_seconds       = 10
            failure_threshold     = 3
          }
        }
      }
    }
  }

  depends_on = [null_resource.kind_load_url_image, null_resource.wait_for_kubernetes]
}

# Create service for URL shortener
resource "kubernetes_service" "url_shortener" {
  metadata {
    name      = "url-shortener"
    namespace = kubernetes_namespace.url_shortener.metadata[0].name
  }

  spec {
    selector = {
      app = kubernetes_deployment.url_shortener.spec[0].template[0].metadata[0].labels.app
    }

    port {
      port        = var.url_service_port
      target_port = var.url_service_port
      node_port   = 30002
    }

    type = "NodePort"
  }
}
