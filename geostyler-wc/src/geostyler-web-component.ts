import { GeostylerWebComponent } from './GeostylerWebComponent.js';

const GEOSTYLER_WEB_COMPONENT_TAG = 'geostyler-style-wc';

if (!customElements.get(GEOSTYLER_WEB_COMPONENT_TAG)) {
  customElements.define(GEOSTYLER_WEB_COMPONENT_TAG, GeostylerWebComponent);
}
