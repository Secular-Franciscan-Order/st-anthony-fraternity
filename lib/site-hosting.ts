export const productionOrigin = 'https://stanthonytucson.org';
export const productionHostname = 'stanthonytucson.org';
export const wwwHostname = 'www.stanthonytucson.org';
export const stagingHostname = 'stanthonyfraternity.endian.dev';

export function canonicalRedirect(url: URL): URL | null {
  if (
    url.hostname === wwwHostname ||
    (url.hostname === productionHostname && url.protocol !== 'https:')
  ) {
    const destination = new URL(url);
    destination.protocol = 'https:';
    destination.hostname = productionHostname;
    destination.port = '';
    return destination;
  }
  return null;
}

export function isProductionOrigin(url: URL): boolean {
  return url.origin === productionOrigin;
}
