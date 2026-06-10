export function removeQueryParameters(url: string, keys: string[]): string {
  const keysToExclude = keys.map((key) => key.toLowerCase());
  const [path, query] = url.split('?', 2);

  if (!query) return url;

  const searchParams = new URLSearchParams(query);
  const newParams = new URLSearchParams();

  searchParams.forEach((value, key) => {
    if (!keysToExclude.includes(key.toLowerCase())) {
      newParams.append(key.toUpperCase(), value);
    }
  });
  const newQuery = newParams.toString();
  return newQuery ? `${path}?${newQuery}` : path;
}

export function resolveUrl(url: string, host?: string): string {
  const isRelative = url.startsWith('/') && !url.startsWith('//');
  if (isRelative && host) {
    try {
      const { origin } = new URL(host);
      return `${origin}${url}`;
    } catch {
      return url;
    }
  }
  return url;
}
