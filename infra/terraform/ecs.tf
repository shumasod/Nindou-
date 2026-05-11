# ---- CloudWatch Log Group ----
resource "aws_cloudwatch_log_group" "nindou" {
  name              = "/ecs/${var.project}"
  retention_in_days = 30
}

# ---- ECS Cluster ----
resource "aws_ecs_cluster" "main" {
  name = var.project

  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

resource "aws_ecs_cluster_capacity_providers" "main" {
  cluster_name       = aws_ecs_cluster.main.name
  capacity_providers = ["FARGATE", "FARGATE_SPOT"]

  default_capacity_provider_strategy {
    capacity_provider = "FARGATE"
    weight            = 1
    base              = 1
  }
}

# ---- Task Definition: Server ----
resource "aws_ecs_task_definition" "server" {
  family                   = "${var.project}-server"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.server_cpu
  memory                   = var.server_memory
  execution_role_arn       = aws_iam_role.ecs_execution.arn
  task_role_arn            = aws_iam_role.ecs_task_server.arn

  container_definitions = jsonencode([{
    name      = "server"
    image     = "${aws_ecr_repository.server.repository_url}:${var.server_image_tag}"
    essential = true

    portMappings = [{ containerPort = 3001, protocol = "tcp" }]

    environment = [
      { name = "NODE_ENV",        value = "production" },
      { name = "PORT",            value = "3001" },
      { name = "REDIS_URL",       value = "rediss://${aws_elasticache_replication_group.redis.primary_endpoint_address}:6379" },
      { name = "ALLOWED_ORIGIN",  value = var.allowed_origin != "" ? var.allowed_origin : "https://${aws_cloudfront_distribution.main.domain_name}" },
      { name = "DB_DIR",          value = "/data/db" },
    ]

    mountPoints = [{
      sourceVolume  = "sqlite-data"
      containerPath = "/data/db"
      readOnly      = false
    }]

    healthCheck = {
      command     = ["CMD-SHELL", "wget -qO- http://localhost:3001/health || exit 1"]
      interval    = 20
      timeout     = 5
      retries     = 3
      startPeriod = 15
    }

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.nindou.name
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "server"
      }
    }

    stopTimeout = 30
  }])

  volume {
    name = "sqlite-data"
    efs_volume_configuration {
      file_system_id          = aws_efs_file_system.sqlite.id
      transit_encryption      = "ENABLED"
      authorization_config {
        access_point_id = aws_efs_access_point.sqlite.id
        iam             = "ENABLED"
      }
    }
  }
}

# ---- Task Definition: Frontend ----
resource "aws_ecs_task_definition" "frontend" {
  family                   = "${var.project}-frontend"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.frontend_cpu
  memory                   = var.frontend_memory
  execution_role_arn       = aws_iam_role.ecs_execution.arn
  task_role_arn            = aws_iam_role.ecs_task_frontend.arn

  container_definitions = jsonencode([{
    name      = "frontend"
    image     = "${aws_ecr_repository.frontend.repository_url}:${var.frontend_image_tag}"
    essential = true

    portMappings = [{ containerPort = 3000, protocol = "tcp" }]

    environment = [
      { name = "NODE_ENV",    value = "production" },
      { name = "PORT",        value = "3000" },
      { name = "SERVER_URL",  value = "http://${aws_service_discovery_service.server.name}.${aws_service_discovery_private_dns_namespace.main.name}:3001" },
    ]

    healthCheck = {
      command     = ["CMD-SHELL", "wget -qO- http://localhost:3000 || exit 1"]
      interval    = 30
      timeout     = 5
      retries     = 3
      startPeriod = 20
    }

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.nindou.name
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "frontend"
      }
    }

    stopTimeout = 30
  }])
}

# ---- Task Definition: Nginx ----
resource "aws_ecs_task_definition" "nginx" {
  family                   = "${var.project}-nginx"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.nginx_cpu
  memory                   = var.nginx_memory
  execution_role_arn       = aws_iam_role.ecs_execution.arn
  task_role_arn            = aws_iam_role.ecs_task_nginx.arn

  container_definitions = jsonencode([{
    name      = "nginx"
    image     = "${aws_ecr_repository.nginx.repository_url}:${var.nginx_image_tag}"
    essential = true

    portMappings = [{ containerPort = 80, protocol = "tcp" }]

    healthCheck = {
      command     = ["CMD-SHELL", "wget -qO- http://localhost/nginx-health || exit 1"]
      interval    = 15
      timeout     = 3
      retries     = 3
      startPeriod = 10
    }

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.nindou.name
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "nginx"
      }
    }

    stopTimeout = 10
  }])
}

# ---- Cloud Map (Service Discovery) ----
resource "aws_service_discovery_private_dns_namespace" "main" {
  name = "${var.project}.local"
  vpc  = aws_vpc.main.id
}

resource "aws_service_discovery_service" "server" {
  name = "server"

  dns_config {
    namespace_id   = aws_service_discovery_private_dns_namespace.main.id
    routing_policy = "MULTIVALUE"
    dns_records {
      ttl  = 10
      type = "A"
    }
  }

  health_check_custom_config { failure_threshold = 1 }
}

resource "aws_service_discovery_service" "frontend" {
  name = "frontend"

  dns_config {
    namespace_id   = aws_service_discovery_private_dns_namespace.main.id
    routing_policy = "MULTIVALUE"
    dns_records {
      ttl  = 10
      type = "A"
    }
  }

  health_check_custom_config { failure_threshold = 1 }
}

# ---- ECS Services ----
resource "aws_ecs_service" "server" {
  name                   = "${var.project}-server"
  cluster                = aws_ecs_cluster.main.id
  task_definition        = aws_ecs_task_definition.server.arn
  desired_count          = 1
  enable_execute_command = true

  # SQLite requires single writer; use DAEMON or keep desired_count=1
  deployment_minimum_healthy_percent = 0
  deployment_maximum_percent         = 100

  capacity_provider_strategy {
    capacity_provider = "FARGATE"
    weight            = 1
  }

  network_configuration {
    subnets          = aws_subnet.private[*].id
    security_groups  = [aws_security_group.server.id]
    assign_public_ip = false
  }

  service_registries {
    registry_arn = aws_service_discovery_service.server.arn
  }

  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  lifecycle {
    ignore_changes = [task_definition, desired_count]
  }
}

resource "aws_ecs_service" "frontend" {
  name                   = "${var.project}-frontend"
  cluster                = aws_ecs_cluster.main.id
  task_definition        = aws_ecs_task_definition.frontend.arn
  desired_count          = 2
  enable_execute_command = true

  deployment_minimum_healthy_percent = 50
  deployment_maximum_percent         = 200

  capacity_provider_strategy {
    capacity_provider = "FARGATE"
    weight            = 1
  }

  network_configuration {
    subnets          = aws_subnet.private[*].id
    security_groups  = [aws_security_group.frontend.id]
    assign_public_ip = false
  }

  service_registries {
    registry_arn = aws_service_discovery_service.frontend.arn
  }

  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  lifecycle {
    ignore_changes = [task_definition, desired_count]
  }
}

resource "aws_ecs_service" "nginx" {
  name                   = "${var.project}-nginx"
  cluster                = aws_ecs_cluster.main.id
  task_definition        = aws_ecs_task_definition.nginx.arn
  desired_count          = 2
  enable_execute_command = true

  deployment_minimum_healthy_percent = 50
  deployment_maximum_percent         = 200

  capacity_provider_strategy {
    capacity_provider = "FARGATE"
    weight            = 1
  }

  network_configuration {
    subnets          = aws_subnet.private[*].id
    security_groups  = [aws_security_group.nginx.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.nginx.arn
    container_name   = "nginx"
    container_port   = 80
  }

  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  lifecycle {
    ignore_changes = [task_definition, desired_count]
  }

  depends_on = [aws_lb_listener.http]
}

# ---- Auto Scaling: Frontend ----
resource "aws_appautoscaling_target" "frontend" {
  max_capacity       = 6
  min_capacity       = 1
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.frontend.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "frontend_cpu" {
  name               = "${var.project}-frontend-cpu-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.frontend.resource_id
  scalable_dimension = aws_appautoscaling_target.frontend.scalable_dimension
  service_namespace  = aws_appautoscaling_target.frontend.service_namespace

  target_tracking_scaling_policy_configuration {
    target_value       = 60.0
    scale_in_cooldown  = 120
    scale_out_cooldown = 60

    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
  }
}

# ---- Auto Scaling: Nginx ----
resource "aws_appautoscaling_target" "nginx" {
  max_capacity       = 4
  min_capacity       = 1
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.nginx.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "nginx_cpu" {
  name               = "${var.project}-nginx-cpu-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.nginx.resource_id
  scalable_dimension = aws_appautoscaling_target.nginx.scalable_dimension
  service_namespace  = aws_appautoscaling_target.nginx.service_namespace

  target_tracking_scaling_policy_configuration {
    target_value       = 60.0
    scale_in_cooldown  = 120
    scale_out_cooldown = 60

    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
  }
}
