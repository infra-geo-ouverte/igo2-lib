export enum QueryFormat {
  GML2 = 'gml2',
  GML3 = 'gml3',
  JSON = 'json',
  GEOJSON = 'geojson',
  GEOJSON2 = 'geojson2',
  ESRIJSON = 'esrijson',
  TEXT = 'text',
  HTML = 'html',
  HTMLGML2 = 'htmlgml2'
}

export enum QueryFormatMimeType {
  GML2 = 'application/vnd.ogc.gml',
  GML3 = 'application/vnd.ogc.gml/3.1.1',
  JSON = 'application/json',
  GEOJSON = 'application/geojson',
  GEOJSON2 = 'geojson',
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
  ESRIJSON = 'application/json',
  TEXT = 'text/plain',
  HTML = 'text/html',
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
  HTMLGML2 = 'text/html'
}

export enum QueryHtmlTarget {
  IFRAME = 'iframe',
  BLANK = '_blank'
}
