import { Placement } from '@floating-ui/utils';

export interface InteractiveTourStep {
  element?: string;
  position?: Placement;
  title?: string;
  text: string;
  beforeShow?: InteractiveTourAction;
  beforeChange?: InteractiveTourAction;
  onShow?: InteractiveTourAction;
  onHide?: InteractiveTourAction;
  class?: string;
  highlightClass?: string;
  scrollToElement?: boolean;
  disableInteraction?: boolean;
  noBackButton?: boolean;
}

export interface InteractiveTourAction {
  element?: string;
  action: 'click';
  condition?: string;
  waitFor?: string;
  maxWait?: number; // in millisecond
}

export interface InteractiveTourOptions {
  steps: InteractiveTourStep[];
  position?: string;
  title?: string;
  /* CSS class that is added to the hightlight element */
  highlightClass?: string;
  /* CSS class that is added to the modal container */
  class?: string;
  /* Scroll to highlighted element? */
  scrollToElement?: boolean;
  /* Disable an interaction with element? */
  disableInteraction?: boolean;
  /* Element to check to be able to start the tour */
  conditions?: string[];
}
