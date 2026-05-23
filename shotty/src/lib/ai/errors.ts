export function apiErrorHint(msg: string): string {
  return /quota|429|503|RESOURCE_EXHAUSTED|high demand|overloaded/i.test(msg)
    ? '（時間をおいて再試行してください。https://ai.google.dev/gemini-api/docs/rate-limits ）'
    : ''
}
