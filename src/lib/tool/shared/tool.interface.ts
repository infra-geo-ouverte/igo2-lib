export interface Tool {
  name: string;
  title?: string;
  icon?: string;
  toolbar?: boolean;
  tooltip?: string;
  options?: {[key: string]: any};
}
