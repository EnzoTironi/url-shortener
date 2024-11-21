// Variables for the URL shortener service, using default values for development environment
//for production, we will use the variables from the production.tfvars file

variable "url_service_port" {
  description = "Port for the URL shortener service"
  type        = number
  default     = 3002
}

variable "iam_service_port" {
  description = "Port for the IAM service"
  type        = number
  default     = 3001
}

variable "node_env" {
  description = "Node environment"
  type        = string
  default     = "development"
}

variable "database_url_url" {
  description = "Database URL for the URL shortener service"
  type        = string
  default     = "postgresql://url_user:urlpass@url-db-postgresql.url-shortener.svc.cluster.local:5432/url_db"
}

variable "database_url_iam" {
  description = "Database URL for the IAM service"
  type        = string
  default     = "postgresql://iam_user:iampass@iam-db-postgresql.url-shortener.svc.cluster.local:5432/iam_db"
}

variable "url_service_url" {
  description = "URL for the URL shortener service"
  type        = string
  default     = "http://url-shortener:3002"
}

variable "iam_service_url" {
  description = "URL for the IAM service"
  type        = string
  default     = "http://iam:3001"
}

variable "iam_db_name" {
  description = "Database name for IAM service"
  type        = string
  default     = "iam_db"
}

variable "iam_db_user" {
  description = "Database user for IAM service"
  type        = string
  default     = "iam_user"
}

variable "iam_db_password" {
  description = "Database password for IAM service"
  type        = string
  default     = "iampass"
}

variable "url_db_name" {
  description = "Database name for URL service"
  type        = string
  default     = "url_db"
}

variable "url_db_user" {
  description = "Database user for URL service"
  type        = string
  default     = "url_user"
}

variable "url_db_password" {
  description = "Database password for URL service"
  type        = string
  default     = "urlpass"
} 
