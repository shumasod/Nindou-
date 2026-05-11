output "alb_dns_name" {
  description = "ALB DNS name (use as CloudFront origin)"
  value       = aws_lb.main.dns_name
}

output "cloudfront_domain" {
  description = "CloudFront distribution domain (point DNS here)"
  value       = aws_cloudfront_distribution.main.domain_name
}

output "ecr_server_url" {
  description = "ECR repository URL for server image"
  value       = aws_ecr_repository.server.repository_url
}

output "ecr_frontend_url" {
  description = "ECR repository URL for frontend image"
  value       = aws_ecr_repository.frontend.repository_url
}

output "ecr_nginx_url" {
  description = "ECR repository URL for nginx image"
  value       = aws_ecr_repository.nginx.repository_url
}

output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = aws_ecs_cluster.main.name
}

output "redis_primary_endpoint" {
  description = "ElastiCache Redis primary endpoint address"
  value       = aws_elasticache_replication_group.redis.primary_endpoint_address
  sensitive   = true
}

output "efs_file_system_id" {
  description = "EFS file system ID for SQLite data"
  value       = aws_efs_file_system.sqlite.id
}

output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = aws_subnet.private[*].id
}

output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = aws_subnet.public[*].id
}
