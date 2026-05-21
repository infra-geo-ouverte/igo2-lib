import { GeoJSONFeatureCollection } from 'ol/format/GeoJSON';

import r2wc from '@r2wc/react-to-web-component';
import { GeoStylerContext, Style, locale } from 'geostyler';
import { Data } from 'geostyler-data';
import { GeoJsonDataParser } from 'geostyler-geojson-parser';
import { Style as GsStyle } from 'geostyler-style';
import React, { useEffect, useMemo } from 'react';

const GeostylerStyleAdapter: React.FC<{
  container?: HTMLElement;
  data: GeoJSONFeatureCollection;
  geostylerStyle: GsStyle;
}> = ({ container, data, geostylerStyle }) => {
  const geoJsonParser = useMemo(() => new GeoJsonDataParser(), []);

  const [dataD, setDataD] = React.useState<Data | null>(null);

  const emitStyleChange = (newStyle: GsStyle) => {
    container?.dispatchEvent(
      new CustomEvent('style-change', {
        detail: newStyle,
        bubbles: true,
        composed: true
      })
    );
  };

  useEffect(() => {
    if (!data) return;

    geoJsonParser.readData(data).then((gsData) => setDataD(gsData));
  }, [data]);

  return (
    <div>
      <GeoStylerContext.Provider value={{ data: dataD, locale: locale.fr_FR }}>
        <Style style={geostylerStyle} onStyleChange={emitStyleChange} />
      </GeoStylerContext.Provider>
    </div>
  );
};

export const GeostylerWebComponent = r2wc(GeostylerStyleAdapter, {
  props: { geostylerStyle: 'json', data: 'json' }
});
