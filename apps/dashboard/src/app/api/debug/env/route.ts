export function GET() {
  const has = (k: string) => Boolean(process.env[k]);
  return Response.json({
    hasGithubId: has("GITHUB_CLIENT_ID"),
    hasGithubSecret: has("GITHUB_CLIENT_SECRET"),
    hasGoogleId: has("GOOGLE_CLIENT_ID"),
    hasGoogleSecret: has("GOOGLE_CLIENT_SECRET"),
    hasDb: has("OTM_DATABASE_URL"),
    hasUpstashUrl: has("OTM_UPSTASH_REDIS_REST_URL"),
    hasUpstashToken: has("OTM_UPSTASH_REDIS_REST_TOKEN"),
  });
}
