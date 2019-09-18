export interface SearchSourceOptions {
  title?: string;
  searchUrl?: string;
  available?: boolean;
  enabled?: boolean;
  order?: number;
  distance?: number;
  zoomMaxOnSelect?: number;
  params?: { [key: string]: string };
  settings?: SearchSourceSettings[];
}

export interface SearchSourceSettings {
  type: 'radiobutton' | 'checkbox';
  values: SettingOptions[];
  title: string;
  name: string;
  allEnabled?: boolean;
}

export interface SettingOptions {
  value: string | number;
  enabled: boolean;
  title: string;
  hashtags?: string[];
  available?: boolean;
}

export interface TextSearchOptions {
  params?: { [key: string]: string };
}

export interface ReverseSearchOptions {
  distance?: number;
  zoom?: number;
  params?: { [key: string]: string };
}
