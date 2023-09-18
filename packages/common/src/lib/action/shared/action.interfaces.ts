import { Observable } from 'rxjs';

export interface Action {
  id: string;
  handler: ActionHandler;
  title?: string;
  icon?: string | Observable<string>;
  tooltip?: string | Observable<string>;
  args?: any[];
  checkbox?: boolean;
  checkCondition?: boolean | Observable<boolean>;
  display?: (...args: any[]) => Observable<boolean>;
  availability?: (...args: any[]) => Observable<boolean>;
  ngClass?: (...args: any[]) => Observable<{ [key: string]: boolean }>;
}

export type ActionHandler = (...args: any[]) => void;
