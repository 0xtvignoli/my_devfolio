/**
 * Fetches the terraform-ci workflow history so the lab can show evidence
 * instead of a claim: every Terraform module in this repo is validated and
 * planned against a real (emulated) AWS API in CI.
 *
 * Fetched at build time, unauthenticated (public repo, 60 req/h per IP — one
 * call per build). Every failure path returns an empty list: a portfolio must
 * not stop building because GitHub rate-limited it.
 */

const REPO = '0xtvignoli/my_devfolio';
const WORKFLOW = 'terraform-ci.yml';

export const CI_WORKFLOW_URL = `https://github.com/${REPO}/actions/workflows/${WORKFLOW}`;

export type CiRun = {
  id: number;
  /** 'success' | 'failure' | 'cancelled' | … null while still running. */
  conclusion: string | null;
  createdAt: string;
  shortSha: string;
  runNumber: number;
  event: string;
  url: string;
};

type GitHubRun = {
  id: number;
  conclusion: string | null;
  created_at: string;
  head_sha: string;
  run_number: number;
  event: string;
  html_url: string;
};

export async function fetchCiRuns(limit = 5): Promise<CiRun[]> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${REPO}/actions/workflows/${WORKFLOW}/runs?per_page=${limit}`,
      {
        headers: {
          Accept: 'application/vnd.github+json',
          // GitHub rejects requests without one.
          'User-Agent': 'devfolio-build',
        },
        // Harmless while fully static; picks up a fresher run if ISR is ever enabled.
        next: { revalidate: 86_400 },
      }
    );
    if (!response.ok) return [];

    const data = (await response.json()) as { workflow_runs?: GitHubRun[] };
    return (data.workflow_runs ?? []).map((run) => ({
      id: run.id,
      conclusion: run.conclusion,
      createdAt: run.created_at,
      shortSha: run.head_sha.slice(0, 7),
      runNumber: run.run_number,
      event: run.event,
      url: run.html_url,
    }));
  } catch {
    return [];
  }
}
