terraform {
  required_version = ">= 1.7"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Uncomment and fill in to use S3 remote state
  # backend "s3" {
  #   bucket         = "nindou-terraform-state"
  #   key            = "prod/terraform.tfstate"
  #   region         = "ap-northeast-1"
  #   dynamodb_table = "nindou-terraform-locks"
  #   encrypt        = true
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "nindou"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

# CloudFront requires ACM certs in us-east-1
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"

  default_tags {
    tags = {
      Project     = "nindou"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}
