# Create deployment for IAM
resource "kubernetes_deployment" "iam" {
  metadata {
    name      = "iam"
    namespace = kubernetes_namespace.url_shortener.metadata[0].name
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        app = "iam"
      }
    }

    template {
      metadata {
        labels = {
          app = "iam"
        }
      }

      spec {
        container {
          name  = "iam"
          image = "iam:local"

          port {
            container_port = var.iam_service_port
          }

          env {
            name  = "NODE_ENV"
            value = var.node_env
          }

          env {
            name  = "DATABASE_URL_IAM"
            value = var.database_url_iam
          }

          env {
            name  = "IAM_SERVICE_URL"
            value = var.iam_service_url
          }

          liveness_probe {
            http_get {
              path = "/api/health"
              port = var.iam_service_port
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

  depends_on = [null_resource.kind_load_iam_image, null_resource.wait_for_kubernetes]
}

# Create service for IAM
resource "kubernetes_service" "iam" {
  metadata {
    name      = "iam"
    namespace = kubernetes_namespace.url_shortener.metadata[0].name
  }

  spec {
    selector = {
      app = kubernetes_deployment.iam.spec[0].template[0].metadata[0].labels.app
    }

    port {
      port        = var.iam_service_port
      target_port = var.iam_service_port
      node_port   = 30001
    }

    type = "NodePort"
  }
}
