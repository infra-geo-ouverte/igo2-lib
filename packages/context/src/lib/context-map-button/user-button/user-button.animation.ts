import {
  AnimationTriggerMetadata,
  animate,
  state,
  style,
  transition,
  trigger
} from '@angular/animations';

export function userButtonSlideInOut(): AnimationTriggerMetadata {
  return trigger('userButtonState', [
    state(
      'collapse',
      style({
        width: '0',
        overflow: 'hidden'
      })
    ),
    state(
      'expand',
      style({
        overflow: 'hidden'
      })
    ),
    transition('collapse => expand', animate('200ms')),
    transition('expand => collapse', animate('200ms'))
  ]);
}
