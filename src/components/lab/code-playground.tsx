'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, FileCode, Cloud, Database, Box, GitBranch } from 'lucide-react';
import { CodeSandboxEmbed } from '@/components/shared/codesandbox-embed';
import { cn } from '@/lib/utils';
import type { Locale, Translations } from '@/lib/types';

interface TerraformTemplate {
  id: string;
  name: string;
  description: string;
  sandboxId: string;
  icon: typeof Code2;
  tags: string[];
}

interface CodePlaygroundProps {
  locale: Locale;
  translations: Translations;
}

// CodeSandbox Sandbox IDs
// TODO: Replace these placeholder IDs with actual CodeSandbox sandbox IDs
// Instructions: See CODESANDBOX_SETUP_GUIDE.md
// 
// To get a sandbox ID:
// 1. Create a sandbox on CodeSandbox.io
// 2. Copy the ID from the URL: https://codesandbox.io/s/YOUR_SANDBOX_ID
// 3. Replace the placeholder below
const TERRAFORM_TEMPLATES: TerraformTemplate[] = [
  {
    id: 'eks-cluster',
    name: 'EKS Cluster',
    description: 'Production-ready EKS cluster with node groups, IAM roles, and networking',
    sandboxId: 'summer-tree-z6nwdp', // Real CodeSandbox ID for testing
    icon: Cloud,
    tags: ['Kubernetes', 'AWS', 'EKS', 'Terraform']
  },
  {
    id: 'vpc-network',
    name: 'VPC Network',
    description: 'Multi-AZ VPC with public/private subnets, NAT gateway, and security groups',
    sandboxId: 'placeholder-vpc', // TODO: Replace with actual CodeSandbox ID
    icon: FileCode,
    tags: ['AWS', 'VPC', 'Networking', 'Terraform']
  },
  {
    id: 'rds-database',
    name: 'RDS Database',
    description: 'RDS PostgreSQL with automated backups, encryption, and monitoring',
    sandboxId: 'placeholder-rds', // TODO: Replace with actual CodeSandbox ID
    icon: Database,
    tags: ['AWS', 'RDS', 'PostgreSQL', 'Terraform']
  },
  {
    id: 's3-bucket',
    name: 'S3 Bucket',
    description: 'Secure S3 bucket with versioning, encryption, and lifecycle policies',
    sandboxId: 'placeholder-s3', // TODO: Replace with actual CodeSandbox ID
    icon: Box,
    tags: ['AWS', 'S3', 'Storage', 'Terraform']
  },
  {
    id: 'cicd-pipeline',
    name: 'CI/CD Pipeline',
    description: 'GitHub Actions workflow for Terraform with policy checks and automated deployments',
    sandboxId: 'placeholder-cicd', // TODO: Replace with actual CodeSandbox ID
    icon: GitBranch,
    tags: ['CI/CD', 'GitHub Actions', 'Terraform', 'Automation']
  }
];

export function CodePlayground({ locale, translations }: CodePlaygroundProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<TerraformTemplate | null>(null);

  return (
    <div className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-b-lg h-[28rem] text-sm border border-cyan-500/30 shadow-2xl shadow-cyan-500/20 flex flex-col overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 opacity-50 pointer-events-none" />
      
      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(6,182,212,0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(6,182,212,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
        }}
      />

      {/* Header */}
      <div className="relative flex items-center gap-2 p-3 bg-gradient-to-r from-slate-900/90 via-slate-800/80 to-slate-900/90 backdrop-blur-sm border-b border-cyan-500/30 text-xs text-slate-300 z-10">
        <Code2 className="h-4 w-4 text-cyan-400" aria-hidden="true" />
        <h3 className="font-semibold text-cyan-300">{translations.codesandbox.title}</h3>
        <span className="text-xs text-slate-500 ml-auto">{translations.codesandbox.description}</span>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        {!selectedTemplate ? (
          /* Template Selection Grid */
          <div className="flex-1 overflow-y-auto p-4 space-y-3 relative z-0">
            <AnimatePresence mode="popLayout">
              {TERRAFORM_TEMPLATES.map((template, index) => {
                const Icon = template.icon;
                return (
                  <motion.button
                    key={template.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedTemplate(template)}
                    className={cn(
                      "w-full text-left rounded-lg border px-4 py-3 backdrop-blur-sm transition-all duration-300",
                      "border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-slate-950/40",
                      "hover:border-cyan-500/50 hover:bg-gradient-to-br hover:from-cyan-500/20 hover:to-blue-500/10",
                      "hover:shadow-lg hover:shadow-cyan-500/20",
                      "focus-visible:outline-2 focus-visible:outline-cyan-500 focus-visible:ring-4 focus-visible:ring-cyan-500/50"
                    )}
                    aria-label={`Select template: ${template.name}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-cyan-500/20 border border-cyan-500/40">
                        <Icon className="h-5 w-5 text-cyan-400" aria-hidden="true" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-cyan-300 mb-1">{template.name}</h4>
                        <p className="text-xs text-slate-400 mb-2">{template.description}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {template.tags.map(tag => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 text-[10px] rounded-full bg-slate-800/60 border border-slate-700/60 text-slate-300"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <motion.div
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="text-cyan-400"
                      >
                        →
                      </motion.div>
                    </div>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          /* CodeSandbox Embed View */
          <div className="flex-1 flex flex-col relative z-0">
            {/* Back button */}
            <div className="p-3 bg-gradient-to-r from-slate-900/90 via-slate-800/80 to-slate-900/90 backdrop-blur-sm border-b border-cyan-500/30">
              <motion.button
                whileHover={{ x: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedTemplate(null)}
                className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                aria-label="Back to templates"
              >
                ← Back to Templates
              </motion.button>
            </div>

            {/* CodeSandbox Embed */}
            <div className="flex-1 p-4">
              <CodeSandboxEmbed
                sandboxId={selectedTemplate.sandboxId}
                title={selectedTemplate.name}
                description={selectedTemplate.description}
                variant="compact"
                height="100%"
                className="h-full"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

