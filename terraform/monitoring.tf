# Elasticsearch Deployment
resource "kubernetes_deployment" "elasticsearch" {
  metadata {
    name      = "elasticsearch"
    namespace = kubernetes_namespace.url_shortener.metadata[0].name
  }

  spec {
    selector {
      match_labels = {
        app = "elasticsearch"
      }
    }

    template {
      metadata {
        labels = {
          app = "elasticsearch"
        }
      }

      spec {
        container {
          name  = "elasticsearch"
          image = "docker.elastic.co/elasticsearch/elasticsearch:8.15.0"

          env {
            name  = "discovery.type"
            value = "single-node"
          }
          env {
            name  = "xpack.security.enabled"
            value = "false"
          }
          env {
            name  = "ES_JAVA_OPTS"
            value = "-Xms1g -Xmx1g"
          }

          port {
            container_port = 9200
          }
          port {
            container_port = 9300
          }
        }
      }
    }
  }
}

# Kibana Deployment
resource "kubernetes_deployment" "kibana" {
  metadata {
    name      = "kibana"
    namespace = kubernetes_namespace.url_shortener.metadata[0].name
  }

  spec {
    selector {
      match_labels = {
        app = "kibana"
      }
    }

    template {
      metadata {
        labels = {
          app = "kibana"
        }
      }

      spec {
        container {
          name  = "kibana"
          image = "docker.elastic.co/kibana/kibana:8.15.0"

          env {
            name  = "ELASTICSEARCH_HOSTS"
            value = "http://elasticsearch.url-shortener.svc.cluster.local:9200"
          }

          port {
            container_port = 5601
          }
        }
      }
    }
  }
}

# Jaeger Deployment
resource "kubernetes_deployment" "jaeger" {
  metadata {
    name      = "jaeger"
    namespace = kubernetes_namespace.url_shortener.metadata[0].name
  }

  spec {
    selector {
      match_labels = {
        app = "jaeger"
      }
    }

    template {
      metadata {
        labels = {
          app = "jaeger"
        }
      }

      spec {
        container {
          name  = "jaeger"
          image = "jaegertracing/all-in-one:1.63.0"

          env {
            name  = "SPAN_STORAGE_TYPE"
            value = "elasticsearch"
          }
          env {
            name  = "ES_SERVER_URLS"
            value = "http://elasticsearch.url-shortener.svc.cluster.local:9200"
          }

          port {
            container_port = 5775
          }
          port {
            container_port = 6831
          }
          port {
            container_port = 6832
          }
          port {
            container_port = 5778
          }
          port {
            container_port = 16686
          }
          port {
            container_port = 14268
          }
          port {
            container_port = 14250
          }
          port {
            container_port = 4317
          }
        }
      }
    }
  }
}

# Services for monitoring stack
resource "kubernetes_service" "elasticsearch" {
  metadata {
    name      = "elasticsearch"
    namespace = kubernetes_namespace.url_shortener.metadata[0].name
  }

  spec {
    selector = {
      app = "elasticsearch"
    }

    port {
      name = "http"
      port = 9200
    }
    port {
      name = "transport"
      port = 9300
    }
  }
}

resource "kubernetes_service" "kibana" {
  metadata {
    name      = "kibana"
    namespace = kubernetes_namespace.url_shortener.metadata[0].name
  }

  spec {
    selector = {
      app = "kibana"
    }

    port {
      port        = 5601
      node_port   = 30601
    }

    type = "NodePort"
  }
}

resource "kubernetes_service" "jaeger" {
  metadata {
    name      = "jaeger"
    namespace = kubernetes_namespace.url_shortener.metadata[0].name
  }

  spec {
    selector = {
      app = "jaeger"
    }

    port {
      name        = "ui"
      port        = 16686
      node_port   = 30686
    }

    type = "NodePort"
  }
} 