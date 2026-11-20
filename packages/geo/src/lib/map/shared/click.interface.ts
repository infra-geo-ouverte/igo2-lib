/**
 * The user interaction that triggered the click event:
 * - `click`: left click or tap
 * - `contextmenu`: right click (desktop)
 * - `longpress`: touch long press
 */
export type MapClickTrigger = 'click' | 'contextmenu' | 'longpress';

export interface MapClickEvent {
  trigger: MapClickTrigger;
  longitude: number;
  latitude: number;
  /** Unix epoch in milliseconds */
  timestamp: number;
}

/**
 * Discriminant of the message posted to the parent window on map click
 */
export const MAP_CLICK_MESSAGE_TYPE = 'igo.map.click' as const;

/**
 * Envelope posted to the parent window when the map is embedded
 * in an iframe
 */
export interface MapClickMessage {
  type: typeof MAP_CLICK_MESSAGE_TYPE;
  data: MapClickEvent;
}
