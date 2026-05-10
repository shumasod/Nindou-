# EFS file system for SQLite persistence across ECS task replacements
resource "aws_efs_file_system" "sqlite" {
  creation_token   = "${var.project}-sqlite"
  throughput_mode  = var.efs_throughput_mode
  encrypted        = true

  lifecycle_policy {
    transition_to_ia = "AFTER_30_DAYS"
  }

  tags = { Name = "${var.project}-sqlite-efs" }
}

# Mount targets — one per private subnet
resource "aws_efs_mount_target" "sqlite" {
  count           = var.az_count
  file_system_id  = aws_efs_file_system.sqlite.id
  subnet_id       = aws_subnet.private[count.index].id
  security_groups = [aws_security_group.efs.id]
}

# Access point for the server task (path /db, UID 1001 = appuser)
resource "aws_efs_access_point" "sqlite" {
  file_system_id = aws_efs_file_system.sqlite.id

  posix_user {
    uid = 1001
    gid = 1001
  }

  root_directory {
    path = "/db"
    creation_info {
      owner_uid   = 1001
      owner_gid   = 1001
      permissions = "750"
    }
  }

  tags = { Name = "${var.project}-sqlite-ap" }
}

# Backup policy — daily backups
resource "aws_efs_backup_policy" "sqlite" {
  file_system_id = aws_efs_file_system.sqlite.id
  backup_policy  { status = "ENABLED" }
}
