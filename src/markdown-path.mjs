export function markdownPath(permalink, baseUrl) {
  const page = permalink.replace(/\/+$/, '');
  return page === baseUrl.replace(/\/+$/, '') ? `${baseUrl}index.md` : `${page}.md`;
}
