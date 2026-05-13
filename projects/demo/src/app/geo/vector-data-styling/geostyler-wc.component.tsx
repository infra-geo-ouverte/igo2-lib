import r2wc from '@r2wc/react-to-web-component';
import { GeoStylerContext, Style, locale } from 'geostyler';
import { GeoJsonDataParser } from 'geostyler-geojson-parser';
import React, { useEffect } from 'react';

const GEOSTYLER_WEB_COMPONENT_TAG = 'geostyler-style-wc';

const GeostylerStyleAdapter: React.FC<{
  data: any;
  geostylerStyle: any;
  handleStyleChange: (newStyle: any) => void;
}> = ({ data, geostylerStyle, handleStyleChange }) => {
  const geoJsonParser = new GeoJsonDataParser();

  const [dataD, setDataD] = React.useState(null);

  useEffect(() => {
    geoJsonParser.readData(data).then((gsData) => setDataD(gsData));
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
