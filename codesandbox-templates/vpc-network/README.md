# VPC Network Terraform Template

Production-ready AWS VPC configuration with:

- **Multi-AZ Deployment**: High availability across multiple availability zones
- **Public Subnets**: For resources that need direct internet access
- **Private Subnets**: For resources that should not be directly accessible from the internet
- **NAT Gateways**: For private subnet internet access
- **Security Groups**: Pre-configured for web, app, and database tiers

## Features

- ✅ Multi-AZ deployment
- ✅ Public and private subnets
- ✅ NAT Gateway for each AZ
- ✅ Internet Gateway for public access
- ✅ Security groups for web, app, and database tiers
- ✅ Route tables and associations

## Usage

### Configuration

Create `terraform.tfvars`:

```hcl
vpc_name = "production-vpc"
vpc_cidr = "10.0.0.0/16"
availability_zones = ["us-east-1a", "us-east-1b", "us-east-1c"]
environment = "production"
```

### Deploy

```bash
terraform init
terraform plan
terraform apply
```

## Architecture

```
Internet
   |
   v
Internet Gateway
   |
   +-- Public Subnet (AZ-1) -- NAT Gateway
   |       |                      |
   |       v                      v
   |   Web Tier              Private Subnet (AZ-1)
   |                              |
   |                              v
   |                          App Tier
   |                              |
   |                              v
   |                          Database Tier
   |
   +-- Public Subnet (AZ-2) -- NAT Gateway
           |                      |
           v                      v
       Web Tier              Private Subnet (AZ-2)
                                  |
                                  v
                              App Tier
                                  |
                                  v
                              Database Tier
```

## Security Groups

- **Web SG**: Allows HTTP (80) and HTTPS (443) from internet
- **App SG**: Allows traffic from Web SG on port 8080
- **DB SG**: Allows PostgreSQL (5432) from App SG

## Cost Considerations

- NAT Gateway: ~$0.045/hour per gateway + data transfer
- Elastic IP: Free when attached to NAT Gateway
- VPC: Free
- Subnets: Free

## Next Steps

- Deploy EC2 instances in appropriate subnets
- Set up Application Load Balancer
- Configure Route53 for DNS
- Set up VPN or Direct Connect for hybrid connectivity



