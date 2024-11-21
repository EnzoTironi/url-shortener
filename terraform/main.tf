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
      version = "~> 2.23.0"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.9.0"
    }
  }
  required_version = ">= 1.0.0"
}

provider "kind" {}
provider "docker" {}

provider "kubernetes" {
  config_path = pathexpand("~/.kube/config")
}

provider "helm" {
  kubernetes {
    config_path = pathexpand("~/.kube/config")
  }
}

# Create a Kind cluster
resource "kind_cluster" "default" {
  name           = "url-shortener-cluster"
  wait_for_ready = true

  kind_config {
    kind        = "Cluster"
    api_version = "kind.x-k8s.io/v1alpha4"

    node {
      role = "control-plane"

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
    }
  }
}

# Wait for Kubernetes API to be available
resource "null_resource" "wait_for_kubernetes" {
  depends_on = [kind_cluster.default]

  provisioner "local-exec" {
    command = <<-EOT
      until kubectl get nodes; do
        echo "Waiting for Kubernetes API..."
        sleep 5
      done
    EOT
  }
}

# Create a namespace
resource "kubernetes_namespace" "url_shortener" {
  metadata {
    name = "url-shortener"
  }
  depends_on = [null_resource.wait_for_kubernetes]
}

# Build the IAM Docker image
resource "null_resource" "docker_build_iam" {
  provisioner "local-exec" {
    command = <<-EOT
      cd ${path.root}/.. && \
      docker build \
        -t iam:local \
        -f apps/iam/Dockerfile .
    EOT
  }
  depends_on = [null_resource.wait_for_kubernetes]
}

# Load the IAM image into Kind cluster
resource "null_resource" "kind_load_iam_image" {
  depends_on = [kind_cluster.default, null_resource.docker_build_iam, null_resource.wait_for_kind]

  provisioner "local-exec" {
    command = "kind load docker-image iam:local --name ${kind_cluster.default.name}"
  }
}

# Build the URL Shortener Docker image
resource "null_resource" "docker_build_url" {
  provisioner "local-exec" {
    command = <<-EOT
      cd ${path.root}/.. && \
      docker build \
        -t url-shortener:local \
        -f apps/url-shortener/Dockerfile .
    EOT
  }
  depends_on = [null_resource.wait_for_kubernetes]
}

# Load the URL Shortener image into Kind cluster
resource "null_resource" "kind_load_url_image" {
  depends_on = [kind_cluster.default, null_resource.docker_build_url, null_resource.wait_for_kind]

  provisioner "local-exec" {
    command = "kind load docker-image url-shortener:local --name ${kind_cluster.default.name}"
  }

}


resource "null_resource" "wait_for_kind" {
  depends_on = [kind_cluster.default]

  provisioner "local-exec" {
    command = "sleep 30" # Adjust the duration as needed
  }
}
