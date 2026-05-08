import r2wc from '@r2wc/react-to-web-component';
import { Style } from 'geostyler';
import React from 'react';

const GEOSTYLER_WEB_COMPONENT_TAG = 'geostyler-style-wc';

const GeostylerStyleAdapter: React.FC<{ geostylerStyle: any }> = ({ geostylerStyle }) => {
  return <Style style={geostylerStyle}></Style>;
};

// const GeoWC = r2wc(Style, { props: { style: 'json', onStyleChange: 'function' } });
const GeostylerWebComponent = r2wc(GeostylerStyleAdapter, {
  props: { geostylerStyle: 'json' }
});

if (!customElements.get(GEOSTYLER_WEB_COMPONENT_TAG)) {
  customElements.define(GEOSTYLER_WEB_COMPONENT_TAG, GeostylerWebComponent);
}
