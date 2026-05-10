variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "ap-northeast-1"
}

variable "environment" {
  description = "Deployment environment (prod / staging)"
  type        = string
  default     = "prod"

  validation {
    condition     = contains(["prod", "staging"], var.environment)
    error_message = "environment must be 'prod' or 'staging'."
  }
}

variable "project" {
  description = "Project name used as resource prefix"
  type        = string
  default     = "nindou"
}

# ---- Networking ----
variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "az_count" {
  description = "Number of availability zones to use"
  type        = number
  default     = 2
}

# ---- ECS ----
variable "server_cpu" {
  description = "vCPU units for the server task (1024 = 1 vCPU)"
  type        = number
  default     = 512
}

variable "server_memory" {
  description = "Memory (MiB) for the server task"
  type        = number
  default     = 1024
}

variable "frontend_cpu" {
  description = "vCPU units for the frontend task"
  type        = number
  default     = 512
}

variable "frontend_memory" {
  description = "Memory (MiB) for the frontend task"
  type        = number
  default     = 1024
}

variable "nginx_cpu" {
  description = "vCPU units for the nginx task"
  type        = number
  default     = 256
}

variable "nginx_memory" {
  description = "Memory (MiB) for the nginx task"
  type        = number
  default     = 512
}

variable "server_image_tag" {
  description = "Docker image tag for the server service"
  type        = string
  default     = "latest"
}

variable "frontend_image_tag" {
  description = "Docker image tag for the frontend service"
  type        = string
  default     = "latest"
}

variable "nginx_image_tag" {
  description = "Docker image tag for the nginx service"
  type        = string
  default     = "latest"
}

# ---- ElastiCache ----
variable "redis_node_type" {
  description = "ElastiCache node type"
  type        = string
  default     = "cache.t4g.micro"
}

variable "redis_engine_version" {
  description = "Redis engine version"
  type        = string
  default     = "7.1"
}

# ---- EFS ----
variable "efs_throughput_mode" {
  description = "EFS throughput mode (bursting or provisioned)"
  type        = string
  default     = "bursting"
}

# ---- Application ----
variable "allowed_origin" {
  description = "CORS allowed origin for the Express API"
  type        = string
  default     = ""
}
