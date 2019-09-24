import { Observable } from 'rxjs';

export interface Action {
  id: string;
  handler: ActionHandler;
  title?: string;
  icon?: string;
  tooltip?: string;
  args?: any[];
  availability?: (...args: any[]) => Observable<boolean>;
  ngClass?: (...args: any[]) => Observable<{[key: string]: boolean}>;
}

export type ActionHandler = (...args: any[]) => void;
