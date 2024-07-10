provider "aws" {
  region = "ap-northeast-1"
}

resource "aws_ecs_cluster" "ninja_cluster" {
  name = "ninja-app-cluster"
}

resource "aws_ecr_repository" "ninja_repo" {
  name = "ninja-app-repo"
}

resource "aws_rds_cluster" "ninja_db" {
  cluster_identifier  = "ninja-db-cluster"
  engine              = "aurora-mysql"
  engine_version      = "5.7.mysql_aurora.2.10.2"
  database_name       = "ninja_db"
  master_username     = var.db_username
  master_password     = var.db_password
  skip_final_snapshot = true
}

resource "aws_s3_bucket" "ninja_assets" {
  bucket = "ninja-app-assets"
}

resource "aws_cloudfront_distribution" "ninja_cdn" {
  origin {
    domain_name = aws_s3_bucket.ninja_assets.bucket_regional_domain_name
    origin_id   = "S3-ninja-app-assets"
  }

  enabled             = true
  default_root_object = "index.html"

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-ninja-app-assets"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}