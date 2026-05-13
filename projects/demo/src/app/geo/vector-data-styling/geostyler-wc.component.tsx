import r2wc from '@r2wc/react-to-web-component';
import { GeoStylerContext, Style, locale } from 'geostyler';
import { GeoJsonDataParser } from 'geostyler-geojson-parser';
import React, { useEffect, useRef } from 'react';

const GEOSTYLER_WEB_COMPONENT_TAG = 'geostyler-style-wc';

const GeostylerStyleAdapter: React.FC<{
  data: any;
  geostylerStyle: any;
  handleStyleChange: (newStyle: any) => void;
}> = ({ data, geostylerStyle, handleStyleChange }) => {
  const geoJsonParser = new GeoJsonDataParser();

  const [dataD, setDataD] = React.useState(null);
  const elementRef = useRef<any>(null);

  // Listen for property changes on the web component element
  useEffect(() => {
    const checkForDataChange = () => {
      if (elementRef.current && elementRef.current.data) {
        console.log(
          'Property data detected on element:',
          elementRef.current.data
        );
        return elementRef.current.data;
      }
      return null;
    };

    const elementData = checkForDataChange();
    const effectiveData = data || elementData;

    console.log(
      effectiveData ? 'Data received for parsing' : 'No data received'
    );
    if (!effectiveData) return;

    geoJsonParser.readData(effectiveData).then((gsData) => setDataD(gsData));
  }, [data]);

  return (
    <GeoStylerContext value={{ data: dataD, locale: locale.fr_FR }}>
      <Style style={geostylerStyle} onStyleChange={handleStyleChange} />
    </GeoStylerContext>
  );
};

const GeostylerWebComponent = r2wc(GeostylerStyleAdapter, {
  props: { geostylerStyle: 'json', handleStyleChange: 'method', data: 'json' }
});

if (!customElements.get(GEOSTYLER_WEB_COMPONENT_TAG)) {
  customElements.define(GEOSTYLER_WEB_COMPONENT_TAG, GeostylerWebComponent);
}
