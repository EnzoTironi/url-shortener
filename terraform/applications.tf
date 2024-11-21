#URL SHORTENER SERVICE-Deployment
resource "kubernetes_deployment" "url_shortener" {
  metadata {
    name      = "url-shortener-service"
    namespace = kubernetes_namespace.url_shortener.metadata[0].name
  }

  spec {
    selector {
      match_labels = {
        app = "url-shortener-service"
      }
    }

    template {
      metadata {
        labels = {
          app = "url-shortener-service"
        }
      }

      spec {
        container {
          name              = "url-shortener-service"
          image             = "url-shortener:local"
          image_pull_policy = "Never"

          env {
            name  = "PORT"
            value = "30002"
          }
          env {
            name = "API_KEY"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.shortener_secrets.metadata[0].name
                key  = "API_KEY"
              }
            }
          }

          port {
            container_port = 30002
          }

          env_from {
            config_map_ref {
              name = kubernetes_config_map.shortener_config.metadata[0].name
            }
          }

          env_from {
            secret_ref {
              name = kubernetes_secret.shortener_secrets.metadata[0].name
            }
          }
        }
      }
    }
  }
}
#URL SHORTENER SERVICE-Service
resource "kubernetes_service" "url_shortener" {
  metadata {
    name      = "url-shortener-service"
    namespace = kubernetes_namespace.url_shortener.metadata[0].name
  }

  spec {
    selector = {
      app = "url-shortener-service"
    }

    port {
      port        = 30002
      target_port = 30002
      node_port   = 30002
    }

    type = "NodePort"
  }
}


#IAM SERVICE-Deployment
resource "kubernetes_deployment" "iam_service" {
  metadata {
    name      = "iam-service"
    namespace = kubernetes_namespace.url_shortener.metadata[0].name
  }

  spec {
    selector {
      match_labels = {
        app = "iam-service"
      }
    }

    template {
      metadata {
        labels = {
          app = "iam-service"
        }
      }

      spec {
        container {
          name              = "iam-service"
          image             = "iam:local"
          image_pull_policy = "Never"

          env {
            name  = "PORT"
            value = "30001"
          }
          env {
            name = "API_KEY"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.shortener_secrets.metadata[0].name
                key  = "API_KEY"
              }
            }
          }

          port {
            container_port = 30001
          }

          env_from {
            config_map_ref {
              name = kubernetes_config_map.shortener_config.metadata[0].name
            }
          }

          env_from {
            secret_ref {
              name = kubernetes_secret.shortener_secrets.metadata[0].name
            }
          }
        }
      }
    }
  }
}

#IAM SERVICE-Service
resource "kubernetes_service" "iam_service" {
  metadata {
    name      = "iam-service"
    namespace = kubernetes_namespace.url_shortener.metadata[0].name
  }

  spec {
    selector = {
      app = "iam-service"
    }

    port {
      port        = 30001
      target_port = 30001
      node_port   = 30001
    }

    type = "NodePort"
  }
}
