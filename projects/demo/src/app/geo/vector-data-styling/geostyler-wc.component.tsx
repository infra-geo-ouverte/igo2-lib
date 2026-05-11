import r2wc from '@r2wc/react-to-web-component';
import { Style } from 'geostyler';
import React from 'react';

const GEOSTYLER_WEB_COMPONENT_TAG = 'geostyler-style-wc';

const GeostylerStyleAdapter: React.FC<{
  geostylerStyle: any;
  handleStyleChange: (newStyle: any) => void;
}> = ({ geostylerStyle, handleStyleChange }) => {
  return <Style style={geostylerStyle} onStyleChange={handleStyleChange} />;
};

const GeostylerWebComponent = r2wc(GeostylerStyleAdapter, {
  props: { geostylerStyle: 'json', handleStyleChange: 'method' }
});

if (!customElements.get(GEOSTYLER_WEB_COMPONENT_TAG)) {
  customElements.define(GEOSTYLER_WEB_COMPONENT_TAG, GeostylerWebComponent);
}
