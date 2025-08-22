
'use server';
/**
 * @fileOverview An AI flow for generating dynamic DevOps simulation scenarios.
 *
 * - generateScenario - A function that creates a unique DevOps scenario.
 * - Scenario - The return type for the generateScenario function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

// Define the schema for a single pipeline stage
const StageSchema = z.object({
  name: z.string().describe('The concise name of this pipeline stage (e.g., "Helm Lint", "Deploy to Staging").'),
  duration: z.number().describe('The realistic duration of this stage in seconds (e.g., 30, 120).'),
  status: z.enum(['success', 'failure']).describe('The final status of this stage.'),
  logOutput: z.string().describe("A realistic, multi-line log output for this stage. For 'failure' status, this should contain detailed error messages, stack traces, or diagnostic information that a real-world tool would produce. For 'success', it can be a standard success message."),
});

// Define the schema for the entire scenario
const AffectedServiceSchema = z.object({
  name: z.string().describe('Service name exactly matching one in services list.'),
  status: z.enum(['OPERATIONAL','DEGRADED','OUTAGE']).describe('Resulting status during the incident.'),
  impactNote: z.string().describe('Short description of impact on this service.')
});

const ScenarioSchema = z.object({
  scenarioTitle: z.string().describe('A creative, short title for the overall scenario (e.g., "Smooth Sailing Deployment", "Database Migration Glitch").'),
  scenarioDescription: z.string().describe("A brief, user-friendly, one-sentence explanation of what this scenario simulates."),
  isIncident: z.boolean().describe("Set to true if the scenario represents a failure, outage, or any kind of problem. Set to false for a successful, 'happy path' scenario."),
  services: z.array(z.string()).describe('An array of 3 to 5 creative and relevant service names for this scenario (e.g., "Auth Service", "Data-Ingest-Worker").'),
  pipeline: z.array(StageSchema).describe('An array of 4 to 6 stages representing a realistic CI/CD pipeline that reflects the scenario title.'),
  logTheme: z.string().describe('A short theme for the log messages that will be generated, reflecting the scenario (e.g., "database connection errors", "user authentication traffic", "cache eviction").'),
  affectedServices: z.array(AffectedServiceSchema).default([]).describe('Optional per-service impact definitions for the incident.'),
});

export type Scenario = z.infer<typeof ScenarioSchema>;

export async function generateScenario(): Promise<Scenario> {
  return generateScenarioFlow();
}

const prompt = ai.definePrompt({
  name: 'generateScenarioPrompt',
  output: {schema: ScenarioSchema},
  prompt: `
    You are a DevOps Scenario Simulator. Your task is to generate a unique and interesting CI/CD pipeline scenario.

  Create a scenario with a clear theme. The scenario should consist of a title, a short user-friendly description, a boolean 'isIncident' flag, a list of relevant services, a sequence of pipeline stages, and a theme for log messages that matches the scenario.

  If isIncident is true, also include an 'affectedServices' array describing which services degrade or go OUTAGE. Only include services from the 'services' list. Provide 1-3 affected services max. If no incident, use an empty array.

    **Crucially, you must decide if the scenario represents an incident.**
    - If the pipeline has any 'failure' stages, or represents a problem like a security vulnerability, resource contention, or an outage, you **MUST** set 'isIncident' to true.
    - If the pipeline is successful and represents normal operation (e.g., a standard deployment, an initial setup), you **MUST** set 'isIncident' to false.

    For example:
    - A scenario could be a "Canary Release Rollback" where smoke tests fail. The failing stage's logOutput should contain realistic test runner output showing assertion errors. The description should be "Simulates a canary deployment that fails its automated tests and is automatically rolled back." 'isIncident' would be true.
    - A scenario could be a "Resource Starvation Incident" where a deployment fails because of insufficient CPU quota. The failing logOutput should include Kubernetes messages like 'FailedScheduling' and 'Insufficient cpu'. The description should explain that a service fails to deploy due to cluster resource limits. 'isIncident' would be true.
    - A scenario could be an "Initial Platform Setup" with longer stages for provisioning infrastructure, with all stages succeeding and having simple success messages in their logOutput. The description could be "Simulates the successful, first-time deployment of a new application stack." 'isIncident' would be false.

    Make the scenario creative and plausible. The services, pipeline stages, durations, statuses, and especially the logOutput for each stage should logically follow the scenario's theme. The logOutput is critical for realism. The scenarioDescription must be a single, concise sentence.
  `,
});

const generateScenarioFlow = ai.defineFlow(
  {
    name: 'generateScenarioFlow',
    outputSchema: ScenarioSchema,
  },
  async () => {
    const {output} = await prompt();
    return output!;
  }
);
