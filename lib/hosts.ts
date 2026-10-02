export function normalizeHost(host: string) {
  return host.toLowerCase().replace(/\.$/, '');
}
export function platformHosts() {
  const configured = (
    process.env.PLATFORM_HOSTS || (process.env.VERCEL ? '' : '127.0.0.1:3000,localhost:3000')
  )
    .split(',')
    .filter(Boolean)
    .map((v) => normalizeHost(v.trim()));
  // Only trusted Vercel system variables, never user-supplied forwarded host headers.
  return [...configured, process.env.VERCEL_PROJECT_PRODUCTION_URL, process.env.VERCEL_URL]
    .filter((host): host is string => !!host)
    .map(normalizeHost);
}
export function isPlatformHost(host: string) {
  return platformHosts().includes(normalizeHost(host));
}
