// Curated action allowlist. Each action is a FIXED sequence of argv arrays —
// no user input is ever interpolated into a command, and commands run via
// spawn() without a shell. This is the core safety property: a visitor can only
// trigger these exact commands against their own isolated (emulated) account.
export const ACTIONS = {
  identity: {
    label: 'Who am I? (isolated session account)',
    steps: [['aws', 'sts', 'get-caller-identity', '--output', 'table']],
  },
  'create-vpc': {
    label: 'Create a VPC',
    steps: [
      ['aws', 'ec2', 'create-vpc', '--cidr-block', '10.0.0.0/16',
        '--tag-specifications', 'ResourceType=vpc,Tags=[{Key=Name,Value=mini-lab}]',
        '--query', 'Vpc.{VpcId:VpcId,Cidr:CidrBlock,State:State}', '--output', 'table'],
    ],
  },
  'list-vpcs': {
    label: 'List VPCs',
    steps: [['aws', 'ec2', 'describe-vpcs',
      '--query', 'Vpcs[].{VpcId:VpcId,Cidr:CidrBlock}', '--output', 'table']],
  },
  'create-bucket': {
    label: 'Create an S3 bucket',
    steps: [['aws', 's3api', 'create-bucket', '--bucket', 'mini-lab-artifacts',
      '--query', 'Location', '--output', 'text']],
  },
  'list-buckets': {
    label: 'List S3 buckets',
    steps: [['aws', 's3api', 'list-buckets', '--query', 'Buckets[].Name', '--output', 'table']],
  },
  'iam-roles': {
    label: 'List IAM roles',
    steps: [['aws', 'iam', 'list-roles', '--query', 'Roles[].RoleName', '--output', 'table']],
  },
  'deploy-eks': {
    label: 'Deploy an EKS cluster',
    // A FIXED bundled script (no user input). This is the heavy one: floci backs
    // EKS with a real k3s container, so it's rate-capped by `heavy` below.
    script: 'deploy-eks.sh',
    timeoutMs: 150_000,
    heavy: true,
  },
};
