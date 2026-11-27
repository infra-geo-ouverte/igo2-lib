/**
 * The user interaction that triggered the press event:
 * - `click`: left click or tap
 * - `contextmenu`: right click (desktop)
 * - `longpress`: touch long press
 */
export type MapPressTrigger = 'click' | 'contextmenu' | 'longpress';

export interface MapPressEvent {
  trigger: MapPressTrigger;
  longitude: number;
  latitude: number;
  /** Unix epoch in milliseconds */
  timestamp: number;
}

/**
 * Discriminant of the message posted to the parent window on map press
 */
export const MAP_PRESS_MESSAGE_TYPE = 'igo.map.press' as const;

/**
 * Envelope posted to the parent window when the map is embedded
 * in an iframe
 */
export interface MapPressMessage {
  type: typeof MAP_PRESS_MESSAGE_TYPE;
  data: MapPressEvent;
}
