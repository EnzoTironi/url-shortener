# Create namespaces
resource "kubernetes_namespace" "url_shortener" {
  metadata {
    name = "url-shortener"
  }
}

# ConfigMap for environment variables
resource "kubernetes_config_map" "shortener_config" {
  metadata {
    name      = "shortener-config"
    namespace = kubernetes_namespace.url_shortener.metadata[0].name
  }

  data = {
    NODE_ENV                = "development"
    LOG_LEVEL               = "debug"
    IAM_SERVICE_PORT        = "30001"
    URL_SERVICE_PORT        = "30002"
    KRAKEND_URL             = "http://krakend.url-shortener.svc.cluster.local:8080"
    IAM_SERVICE_URL         = "http://iam-service.url-shortener.svc.cluster.local:30001"
    URL_SERVICE_URL         = "http://url-shortener-service.url-shortener.svc.cluster.local:30002"
    ELASTICSEARCH_URL       = "http://elasticsearch.url-shortener.svc.cluster.local:9200"
    JAEGER_URL              = "http://jaeger.url-shortener.svc.cluster.local:16686"
    OTLP_COLLECTOR_ENDPOINT = "http://jaeger-collector.url-shortener.svc.cluster.local:14268/api/traces"
  }
}

# Secrets
resource "kubernetes_secret" "shortener_secrets" {
  metadata {
    name      = "shortener-secrets"
    namespace = kubernetes_namespace.url_shortener.metadata[0].name
  }

  data = {
    API_KEY          = "your_api_key"
    DATABASE_URL_IAM = "postgresql://iam_user:iampass@iam-db.url-shortener.svc.cluster.local:5432/iam_db"
    DATABASE_URL_URL = "postgresql://url_user:urlpass@url-db.url-shortener.svc.cluster.local:5432/url_db"
  }
}
