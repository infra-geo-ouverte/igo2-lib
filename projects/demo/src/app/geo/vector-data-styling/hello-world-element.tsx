import r2wc from '@r2wc/react-to-web-component';
import { Style } from 'geostyler';
import React from 'react';

const HELLO_WORLD_TAG = 'hello-world-element';

const TestComponent: React.FC<{ styleR: string }> = ({ styleR }) => {
  return <Style style={JSON.parse(styleR)}></Style>;
};

// const GeoWC = r2wc(Style, { props: { style: 'json', onStyleChange: 'function' } });
const GeoWC = r2wc(TestComponent, { props: { styleR: 'string' } });

if (!customElements.get(HELLO_WORLD_TAG)) {
  customElements.define(HELLO_WORLD_TAG, GeoWC);
}
