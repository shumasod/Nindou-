# ---- ECS Task Execution Role (ECR pull + CloudWatch logs) ----
data "aws_iam_policy_document" "ecs_assume_role" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "ecs_execution" {
  name               = "${var.project}-ecs-execution-role"
  assume_role_policy = data.aws_iam_policy_document.ecs_assume_role.json
}

resource "aws_iam_role_policy_attachment" "ecs_execution_managed" {
  role       = aws_iam_role.ecs_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# ---- ECS Task Role (runtime permissions per service) ----
resource "aws_iam_role" "ecs_task_server" {
  name               = "${var.project}-server-task-role"
  assume_role_policy = data.aws_iam_policy_document.ecs_assume_role.json
}

# Server needs EFS access
data "aws_iam_policy_document" "server_task" {
  statement {
    effect    = "Allow"
    actions   = ["elasticfilesystem:ClientMount", "elasticfilesystem:ClientWrite", "elasticfilesystem:ClientRootAccess"]
    resources = [aws_efs_file_system.sqlite.arn]
  }
}

resource "aws_iam_role_policy" "server_task" {
  name   = "efs-access"
  role   = aws_iam_role.ecs_task_server.id
  policy = data.aws_iam_policy_document.server_task.json
}

resource "aws_iam_role" "ecs_task_frontend" {
  name               = "${var.project}-frontend-task-role"
  assume_role_policy = data.aws_iam_policy_document.ecs_assume_role.json
}

resource "aws_iam_role" "ecs_task_nginx" {
  name               = "${var.project}-nginx-task-role"
  assume_role_policy = data.aws_iam_policy_document.ecs_assume_role.json
}
