import { IconSvg } from '@igo2/common/icon';

export interface Tool {
  name: string;
  component?: any;
  title?: string;
  icon?: string | IconSvg;
  tooltip?: string;
  global?: boolean;
  options?: Record<string, any>;

  parent?: string;
  children?: string[];

  // This is still used with the API but should be removed ultimately
  id?: string;
}

export interface ToolboxOptions {
  toolbar?: string[];
}
