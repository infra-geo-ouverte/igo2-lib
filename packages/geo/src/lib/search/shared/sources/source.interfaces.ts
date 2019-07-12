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
  type: 'radiobutton'|'checkbox',
  values: SettingOptions[],
  title: String,
  name: String;
}

export interface SettingOptions {
  value: string|number;
  enabled: boolean;
  title: string;
}
export interface TextSearchOptions {
  params?: { [key: string]: string };
}

export interface ReverseSearchOptions {
  distance?: number;
  zoom?: number;
  params?: { [key: string]: string };
}
