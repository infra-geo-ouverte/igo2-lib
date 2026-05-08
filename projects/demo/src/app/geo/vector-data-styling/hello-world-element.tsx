import r2wc from '@r2wc/react-to-web-component';
import { Style } from 'geostyler';
import React from 'react';

const HELLO_WORLD_TAG = 'hello-world-element';

// class HelloWorldElement extends HTMLElement {
//   connectedCallback(): void {
//     this.textContent = 'Hello World';
//   }
// }

const TestComponent: React.FC<{ name: string, styleR: string }> = ({ name, styleR }) => {
  return (<>
    <div>{name}{styleR}</div>
    <Style style={JSON.parse(styleR)}></Style>
  </>);
};

// const GeoWC = r2wc(Style, { props: { style: 'json', onStyleChange: 'function' } });
const GeoWC = r2wc(TestComponent, { props: { name: 'string', styleR: 'string' } });

if (!customElements.get(HELLO_WORLD_TAG)) {
  customElements.define(HELLO_WORLD_TAG, GeoWC);
}