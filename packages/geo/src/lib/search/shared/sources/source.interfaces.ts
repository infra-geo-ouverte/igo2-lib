export interface SearchSourceOptions {
  title?: string;
  searchUrl?: string;
  available?: boolean;
  enabled?: boolean;
  order?: number;
  distance?: number;
  zoomMaxOnSelect?: number;
  params?: { [key: string]: string };
}

export interface TextSearchOptions {
  params?: { [key: string]: string };
}

export interface ReverseSearchOptions {
  distance?: number;
  zoom?: number;
  params?: { [key: string]: string };
}
