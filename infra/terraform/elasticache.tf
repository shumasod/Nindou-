# Subnet group for ElastiCache (private subnets only)
resource "aws_elasticache_subnet_group" "redis" {
  name       = "${var.project}-redis-subnet-group"
  subnet_ids = aws_subnet.private[*].id
}

# Parameter group — Redis 7.x with sensible defaults
resource "aws_elasticache_parameter_group" "redis7" {
  family = "redis7"
  name   = "${var.project}-redis7-params"

  parameter {
    name  = "maxmemory-policy"
    value = "allkeys-lru"
  }

  parameter {
    name  = "activerehashing"
    value = "yes"
  }
}

# Replication group for HA (primary + one replica across AZs)
resource "aws_elasticache_replication_group" "redis" {
  replication_group_id = "${var.project}-redis"
  description          = "Redis cache for Nindou save data"

  node_type            = var.redis_node_type
  engine_version       = var.redis_engine_version
  port                 = 6379
  parameter_group_name = aws_elasticache_parameter_group.redis7.name
  subnet_group_name    = aws_elasticache_subnet_group.redis.name
  security_group_ids   = [aws_security_group.redis.id]

  # Primary + 1 replica — failover within ~60s
  num_cache_clusters         = 2
  automatic_failover_enabled = true
  multi_az_enabled           = true

  at_rest_encryption_enabled = true
  transit_encryption_enabled = true

  # Daily snapshot window (JST 04:00–05:00 = UTC 19:00–20:00)
  snapshot_window          = "19:00-20:00"
  snapshot_retention_limit = 7

  # Maintenance window
  maintenance_window = "sun:20:00-sun:21:00"

  apply_immediately = false

  tags = { Name = "${var.project}-redis" }
}
