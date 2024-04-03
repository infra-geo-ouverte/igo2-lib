import { IconSvg } from '../../icons';

export interface Tool {
  name: string;
  component: any;
  title?: string;
  icon?: string;
  iconSvg?: IconSvg;
  tooltip?: string;
  global?: boolean;
  options?: { [key: string]: any };

  parent?: string;
  children?: string[];

  // This is still used with the API but should be removed ultimately
  id?: string;
}

export interface ToolboxOptions {
  toolbar?: string[];
}
