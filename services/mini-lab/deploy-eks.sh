#!/usr/bin/env bash
# FIXED script — no user input reaches it (the backend only passes env creds).
# Provisions an EKS cluster in the session's isolated emulated account, idempotent
# (one cluster per account). Uses aws-cli for a fast, reliable live demo; the real
# Terraform EKS module is separately validated in CI (terraform-ci workflow).
set -euo pipefail

EP="--endpoint-url=${AWS_ENDPOINT_URL:-http://localhost:4566}"
NAME="mini-lab"
export AWS_PAGER=""

echo "Provisioning EKS cluster '${NAME}' in isolated account ${AWS_ACCESS_KEY_ID}…"

# Idempotent: tear down any prior cluster for this account (frees its k3s container).
aws $EP eks delete-cluster --name "$NAME" >/dev/null 2>&1 || true

VPC=$(aws $EP ec2 create-vpc --cidr-block 10.0.0.0/16 --query Vpc.VpcId --output text)
SUB1=$(aws $EP ec2 create-subnet --vpc-id "$VPC" --cidr-block 10.0.1.0/24 --query Subnet.SubnetId --output text)
SUB2=$(aws $EP ec2 create-subnet --vpc-id "$VPC" --cidr-block 10.0.2.0/24 --query Subnet.SubnetId --output text)
echo "  ✓ VPC ${VPC} with 2 subnets"

aws $EP iam create-role --role-name mini-lab-eks \
  --assume-role-policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"eks.amazonaws.com"},"Action":"sts:AssumeRole"}]}' \
  >/dev/null 2>&1 || true
ARN=$(aws $EP iam get-role --role-name mini-lab-eks --query Role.Arn --output text)
echo "  ✓ IAM role for the control plane"

echo "→ creating the cluster (a real k3s control plane spins up)…"
aws $EP eks create-cluster --name "$NAME" --role-arn "$ARN" \
  --resources-vpc-config "subnetIds=${SUB1},${SUB2}" \
  --query 'cluster.{name:name,status:status}' --output table

echo "→ waiting for the control plane to become ACTIVE…"
for _ in $(seq 1 40); do
  S=$(aws $EP eks describe-cluster --name "$NAME" --query 'cluster.status' --output text 2>/dev/null || echo PENDING)
  echo "   status: ${S}"
  [ "$S" = "ACTIVE" ] && break
  sleep 2
done

echo "→ cluster:"
aws $EP eks describe-cluster --name "$NAME" \
  --query 'cluster.{name:name,status:status,version:version,endpoint:endpoint}' --output table
echo "✓ A real (emulated) EKS control plane is running in your session."
