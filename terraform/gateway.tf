# KrakenD Gateway

# KrakenD ConfigMaps
resource "kubernetes_config_map" "krakend_config" {
  metadata {
    name      = "krakend-config"
    namespace = kubernetes_namespace.url_shortener.metadata[0].name
  }

  data = {
    "krakend.json" = file("${path.root}/../apps/api-gateway/krakend.k8s.json")
  }
}

resource "kubernetes_config_map" "krakend_certs" {
  metadata {
    name      = "krakend-certs"
    namespace = kubernetes_namespace.url_shortener.metadata[0].name
  }

  data = {
    "jwks.json"    = file("${path.root}/../certs/jwks.json")
    "private.json" = file("${path.root}/../certs/private.json")
  }
}

resource "kubernetes_deployment" "krakend" {
  metadata {
    name      = "krakend"
    namespace = kubernetes_namespace.url_shortener.metadata[0].name
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        app = "krakend"
      }
    }

    template {
      metadata {
        labels = {
          app = "krakend"
        }
      }

      spec {
        container {
          name  = "krakend"
          image = "devopsfaith/krakend:latest"

          port {
            container_port = 8080
          }

          env {
            name  = "KRAKEND_PORT"
            value = 8080
          }

          # Mount the main config file
          volume_mount {
            name       = "krakend-config"
            mount_path = "/etc/krakend/krakend.json"
            sub_path   = "krakend.json"
          }

          # Mount the certs files
          volume_mount {
            name       = "jwks"
            mount_path = "/etc/krakend/certs/jwks.json"
            sub_path   = "jwks.json"
          }

          volume_mount {
            name       = "private"
            mount_path = "/etc/krakend/certs/private.json"
            sub_path   = "private.json"
          }

          liveness_probe {
            http_get {
              path = "/__health"
              port = 8080
            }
            initial_delay_seconds = 15
            period_seconds        = 10
          }
        }

        # Volume for main config
        volume {
          name = "krakend-config"
          config_map {
            name = kubernetes_config_map.krakend_config.metadata[0].name
          }
        }

        # Separate volumes for each cert file
        volume {
          name = "jwks"
          config_map {
            name = kubernetes_config_map.krakend_certs.metadata[0].name
            items {
              key  = "jwks.json"
              path = "jwks.json"
            }
          }
        }

        volume {
          name = "private"
          config_map {
            name = kubernetes_config_map.krakend_certs.metadata[0].name
            items {
              key  = "private.json"
              path = "private.json"
            }
          }
        }
      }
    }
  }
}

resource "kubernetes_service" "krakend" {
  metadata {
    name      = "krakend"
    namespace = kubernetes_namespace.url_shortener.metadata[0].name
  }

  spec {
    selector = {
      app = "krakend"
    }

    port {
      port        = 8080
      target_port = 8080
      node_port   = 30080
    }

    type = "NodePort"
  }
}
