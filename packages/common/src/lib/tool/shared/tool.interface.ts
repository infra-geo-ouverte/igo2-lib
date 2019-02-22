export interface Tool {
  name: string;
  component: any;
  title?: string;
  icon?: string;
  iconImage?: string;
  tooltip?: string;
  options?: { [key: string]: any };
}
