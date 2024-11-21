# Add the Helm provider and PostgreSQL repository
resource "helm_release" "iam_db" {
  name       = "iam-db"
  namespace  = kubernetes_namespace.url_shortener.metadata[0].name
  repository = "https://charts.bitnami.com/bitnami"
  chart      = "postgresql"
  version    = "12.5.8"

  set {
    name  = "global.postgresql.auth.database"
    value = var.iam_db_name
  }

  set {
    name  = "global.postgresql.auth.username"
    value = var.iam_db_user
  }

  set {
    name  = "global.postgresql.auth.password"
    value = var.iam_db_password
  }

  set {
    name  = "service.ports.postgresql"
    value = "5432"
  }
}

resource "helm_release" "url_db" {
  name       = "url-db"
  namespace  = kubernetes_namespace.url_shortener.metadata[0].name
  repository = "https://charts.bitnami.com/bitnami"
  chart      = "postgresql"
  version    = "12.5.8"

  set {
    name  = "global.postgresql.auth.database"
    value = var.url_db_name
  }

  set {
    name  = "global.postgresql.auth.username"
    value = var.url_db_user
  }

  set {
    name  = "global.postgresql.auth.password"
    value = var.url_db_password
  }

  set {
    name  = "service.ports.postgresql"
    value = "5432"
  }
} 