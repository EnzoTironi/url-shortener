terraform {
  required_providers {
    kind = {
      source  = "tehcyx/kind"
      version = "~> 0.2.0"
    }
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0.0"
    }
    null = {
      source  = "hashicorp/null"
      version = "~> 3.2.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.33.0"
    }
  }
  required_version = ">= 1.0.0"
}

provider "kind" {}
provider "docker" {}

# Create a Kind cluster
resource "kind_cluster" "default" {
  name           = "url-shortener-cluster"
  wait_for_ready = true

  kind_config {
    kind        = "Cluster"
    api_version = "kind.x-k8s.io/v1alpha4"

    node {
      role = "control-plane"

      # Port mappings for services
      extra_port_mappings {
        container_port = 30002
        host_port      = 3002
      }
      extra_port_mappings {
        container_port = 30001
        host_port      = 3001
      }
      extra_port_mappings {
        container_port = 30080
        host_port      = 8080
      }
      extra_port_mappings {
        container_port = 30561
        host_port      = 5601
      }
      extra_port_mappings {
        container_port = 30686
        host_port      = 16686
      }
    }
  }
}

# Configure kubernetes provider to use the cluster's context
provider "kubernetes" {
  host = kind_cluster.default.endpoint

  client_certificate     = kind_cluster.default.client_certificate
  client_key             = kind_cluster.default.client_key
  cluster_ca_certificate = kind_cluster.default.cluster_ca_certificate
}

# Wait for cluster to be ready
resource "null_resource" "wait_for_cluster" {
  depends_on = [kind_cluster.default]

  provisioner "local-exec" {
    command = "sleep 20"
  }
}

# Build and load IAM service image
resource "null_resource" "build_load_iam" {
  depends_on = [null_resource.wait_for_cluster]

  provisioner "local-exec" {
    command = <<-EOT
      cd ${path.root}/../&& \
      docker build -t iam:local -f apps/iam/Dockerfile . && \
      kind load docker-image iam:local --name ${kind_cluster.default.name}
    EOT
  }
}

# Build and load URL Shortener service image
resource "null_resource" "build_load_url_shortener" {
  depends_on = [null_resource.wait_for_cluster]

  provisioner "local-exec" {
    command = <<-EOT
      cd ${path.root}/../ && \
      docker build -t url-shortener:local -f apps/url-shortener/Dockerfile . && \
      kind load docker-image url-shortener:local --name ${kind_cluster.default.name}
    EOT
  }
}

# Output the cluster name
output "cluster_name" {
  value = kind_cluster.default.name
}

# Output the kubeconfig path
output "kubeconfig_path" {
  value = kind_cluster.default.kubeconfig_path
}
