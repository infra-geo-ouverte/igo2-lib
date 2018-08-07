export interface Tool {
  id?: string;
  name: string;
  title?: string;
  icon?: string;
  iconImage?: string;
  inToolbar?: boolean;
  tooltip?: string;
  options?: { [key: string]: any };
}
