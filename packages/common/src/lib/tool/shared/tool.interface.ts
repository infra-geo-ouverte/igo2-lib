export interface Tool {
  name: string;
  component: any;
  title?: string;
  icon?: string;
  iconImage?: string;
  tooltip?: string;
  options?: { [key: string]: any };

  // This is still used with the API but should be removed ultimately
  id?: string;
}

export interface ToolboxOptions {
  toolbar?: string[];
}
