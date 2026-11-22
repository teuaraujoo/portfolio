import type { ContributionDay } from "@/data/home";

const GITHUB_CONTRIBUTIONS_API_BASE = "https://github-contributions-api.jogruber.de/v4";
const REVALIDATE_SECONDS = 3600;
const REQUEST_TIMEOUT_MS = 5000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isValidContributionDay(value: unknown): value is ContributionDay {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.date === "string" &&
    value.date.trim().length > 0 &&
    typeof value.count === "number" &&
    Number.isFinite(value.count) &&
    value.count >= 0
  );
}

/**
 * Busca no servidor as contribuições do último ano de um usuário do GitHub.
 * Retorna `undefined` em falhas, timeouts ou payload inválido para ativar o fallback do componente.
 */
export async function getGithubContributions(
  username: string,
): Promise<ContributionDay[] | undefined> {
  const normalizedUsername = username.trim();
  if (!normalizedUsername) {
    return undefined;
  }

  const endpoint = `${GITHUB_CONTRIBUTIONS_API_BASE}/${encodeURIComponent(normalizedUsername)}?y=last`;

  try {
    const response = await fetch(endpoint, {
      next: { revalidate: REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
      return undefined;
    }

    const payload: unknown = await response.json();
    if (!isRecord(payload) || !Array.isArray(payload.contributions)) {
      return undefined;
    }

    const contributions: ContributionDay[] = [];
    for (const item of payload.contributions) {
      if (isValidContributionDay(item)) {
        contributions.push({
          date: item.date,
          count: item.count,
        });
      }
    }

    return contributions.length > 0 ? contributions : undefined;
  } catch {
    return undefined;
  }
}
