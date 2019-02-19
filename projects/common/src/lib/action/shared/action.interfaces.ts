export interface Action {
  id: string;
  handler: ActionHandler;
  title?: string;
  icon?: string;
  tooltip?: string;
  conditions?: Array<() => boolean>;
}

export type ActionHandler = () => void;
