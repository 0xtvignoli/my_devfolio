# EKS Cluster Terraform Template

Production-ready Amazon EKS (Elastic Kubernetes Service) cluster configuration with:

- **VPC**: Multi-AZ VPC with public and private subnets
- **Networking**: NAT Gateway, Internet Gateway, and route tables
- **EKS Cluster**: Managed Kubernetes control plane
- **Node Group**: Auto-scaling worker nodes
- **IAM Roles**: Properly configured roles for cluster and nodes
- **Logging**: CloudWatch log groups for cluster logs

## Features

- ✅ Multi-AZ deployment for high availability
- ✅ Public and private subnets
- ✅ NAT Gateway for private subnet internet access
- ✅ EKS cluster with managed control plane
- ✅ Auto-scaling node group
- ✅ CloudWatch logging enabled
- ✅ Security best practices

## Usage

### Prerequisites

- AWS Account with appropriate permissions
- Terraform >= 1.0
- AWS CLI configured

### Configuration

1. Update `variables.tf` or create `terraform.tfvars`:

```hcl
cluster_name = "my-production-cluster"
aws_region   = "us-east-1"
node_group_desired_size = 3
node_instance_type = "t3.large"
```

### Deploy

```bash
terraform init
terraform plan
terraform apply
```

### Configure kubectl

After deployment, configure kubectl:

```bash
aws eks update-kubeconfig --name <cluster-name> --region <region>
kubectl get nodes
```

## Outputs

- `cluster_id`: EKS cluster ID
- `cluster_endpoint`: Kubernetes API endpoint
- `vpc_id`: VPC ID
- `public_subnet_ids`: Public subnet IDs
- `private_subnet_ids`: Private subnet IDs

## Cost Considerations

- EKS Control Plane: ~$0.10/hour
- NAT Gateway: ~$0.045/hour + data transfer
- EC2 Instances: Based on instance type
- Data Transfer: Based on usage

## Security Notes

⚠️ **This is a template for demonstration purposes. For production:**

- Review and adjust security groups
- Enable encryption at rest
- Configure OIDC provider for IRSA
- Set up proper IAM policies
- Enable audit logging
- Review network ACLs

## Next Steps

- Install AWS Load Balancer Controller
- Configure Cluster Autoscaler
- Set up monitoring with Prometheus
- Configure ingress controllers
- Deploy applications



