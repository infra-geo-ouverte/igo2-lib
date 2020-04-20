import {
  trigger,
  state,
  style,
  transition,
  animate,
  AnimationTriggerMetadata
} from '@angular/animations';

export function toolSlideInOut(
  speed = '300ms',
  type = 'ease-in-out'
): AnimationTriggerMetadata {
  return trigger('toolSlideInOut', [
    state(
      'enter',
      style({
        transform: 'translateX(100%)'
      })
    ),
    transition('void => enter', animate(speed + ' ' + type))
  ]);
}
