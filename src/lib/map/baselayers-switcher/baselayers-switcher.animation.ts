import { trigger, state, style, transition,
         animate, AnimationTriggerMetadata } from '@angular/animations';

export function baseLayersSwitcherSlideInOut(): AnimationTriggerMetadata {

  return trigger('baseLayerSwitcherState', [
    state('collapse', style({
      height: '85px',
      overflow: 'hidden'
    })),
    state('expand',   style({
      overflow: 'hidden'
    })),
    transition('collapse => expand', animate('200ms')),
    transition('expand => collapse', animate('200ms'))
  ]);
};
