# Database Deployments
resource "kubernetes_deployment" "iam_db" {
  metadata {
    name      = "iam-db"
    namespace = kubernetes_namespace.url_shortener.metadata[0].name
  }

  spec {
    selector {
      match_labels = {
        app = "iam-db"
      }
    }

    template {
      metadata {
        labels = {
          app = "iam-db"
        }
      }

      spec {
        container {
          name  = "iam-db"
          image = "postgres:14-alpine"

          env {
            name  = "POSTGRES_DB"
            value = "iam_db"
          }
          env {
            name  = "POSTGRES_USER"
            value = "iam_user"
          }
          env {
            name  = "POSTGRES_PASSWORD"
            value = "iampass"
          }

          port {
            container_port = 5432
          }
        }
      }
    }
  }
}

resource "kubernetes_deployment" "url_db" {
  metadata {
    name      = "url-db"
    namespace = kubernetes_namespace.url_shortener.metadata[0].name
  }

  spec {
    selector {
      match_labels = {
        app = "url-db"
      }
    }

    template {
      metadata {
        labels = {
          app = "url-db"
        }
      }

      spec {
        container {
          name  = "url-db"
          image = "postgres:14-alpine"

          env {
            name  = "POSTGRES_DB"
            value = "url_db"
          }
          env {
            name  = "POSTGRES_USER"
            value = "url_user"
          }
          env {
            name  = "POSTGRES_PASSWORD"
            value = "urlpass"
          }

          port {
            container_port = 5432
          }
        }
      }
    }
  }
}

#DATABASE-Services
resource "kubernetes_service" "iam_db" {
  metadata {
    name      = "iam-db"
    namespace = kubernetes_namespace.url_shortener.metadata[0].name
  }

  spec {
    selector = {
      app = "iam-db"
    }

    port {
      port        = 5432
      target_port = 5432
    }
  }
}

resource "kubernetes_service" "url_db" {
  metadata {
    name      = "url-db"
    namespace = kubernetes_namespace.url_shortener.metadata[0].name
  }

  spec {
    selector = {
      app = "url-db"
    }

    port {
      port        = 5432
      target_port = 5432
    }
  }
}
