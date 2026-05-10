locals {
  p = var.project
}

# ---- ALB: accepts HTTP/HTTPS from internet ----
resource "aws_security_group" "alb" {
  name        = "${local.p}-alb-sg"
  description = "ALB inbound HTTP/HTTPS"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# ---- Nginx ECS task: only from ALB ----
resource "aws_security_group" "nginx" {
  name        = "${local.p}-nginx-sg"
  description = "Nginx task - traffic from ALB only"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "HTTP from ALB"
    from_port       = 80
    to_port         = 80
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# ---- Frontend ECS task: only from Nginx ----
resource "aws_security_group" "frontend" {
  name        = "${local.p}-frontend-sg"
  description = "Frontend task - traffic from Nginx only"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "Next.js from Nginx"
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.nginx.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# ---- Server ECS task: from Nginx + Frontend ----
resource "aws_security_group" "server" {
  name        = "${local.p}-server-sg"
  description = "Express API task - from Nginx and Frontend"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "API from Nginx"
    from_port       = 3001
    to_port         = 3001
    protocol        = "tcp"
    security_groups = [aws_security_group.nginx.id]
  }

  ingress {
    description     = "API from Frontend SSR"
    from_port       = 3001
    to_port         = 3001
    protocol        = "tcp"
    security_groups = [aws_security_group.frontend.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# ---- ElastiCache Redis: only from Server ----
resource "aws_security_group" "redis" {
  name        = "${local.p}-redis-sg"
  description = "ElastiCache Redis - from server tasks only"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "Redis from server"
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.server.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# ---- EFS: only from Server ----
resource "aws_security_group" "efs" {
  name        = "${local.p}-efs-sg"
  description = "EFS mount target - from server tasks only"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "NFS from server"
    from_port       = 2049
    to_port         = 2049
    protocol        = "tcp"
    security_groups = [aws_security_group.server.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
