# OutreachOS — Terraform Stubs
# These are placeholder configurations for AWS infrastructure.
# Fill in with actual values when deploying to production.

terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  default = "us-east-1"
}

variable "environment" {
  default = "production"
}

# ─── VPC ───────────────────────────────────────────────
# resource "aws_vpc" "main" { ... }

# ─── RDS Aurora PostgreSQL ─────────────────────────────
# resource "aws_rds_cluster" "postgres" { ... }

# ─── ElastiCache Redis ─────────────────────────────────
# resource "aws_elasticache_cluster" "redis" { ... }

# ─── EKS Cluster ──────────────────────────────────────
# resource "aws_eks_cluster" "main" { ... }

# ─── S3 Bucket (uploads, assets) ──────────────────────
# resource "aws_s3_bucket" "uploads" { ... }

# ─── CloudFront CDN ──────────────────────────────────
# resource "aws_cloudfront_distribution" "cdn" { ... }

output "note" {
  value = "Terraform stubs — configure for production deployment"
}
