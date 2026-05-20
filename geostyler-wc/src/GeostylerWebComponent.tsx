import r2wc from '@r2wc/react-to-web-component';
import { GeoStylerContext, Style, locale } from 'geostyler';
import { GeoJsonDataParser } from 'geostyler-geojson-parser';
import React, { useEffect, useMemo, useRef } from 'react';

const GeostylerStyleAdapter: React.FC<{
  data: any;
  geostylerStyle: any;
  handleStyleChange: (newStyle: any) => void;
}> = ({ data, geostylerStyle, handleStyleChange }) => {
  const geoJsonParser = useMemo(() => new GeoJsonDataParser(), []);

  const [dataD, setDataD] = React.useState(null);
  const hostRef = useRef<HTMLDivElement | null>(null);

  const emitStyleChange = (newStyle: any) => {
    const rootNode = hostRef.current?.getRootNode();
    const host = rootNode instanceof ShadowRoot ? rootNode.host : undefined;

    host?.dispatchEvent(
      new CustomEvent('style-change', {
        detail: newStyle,
        bubbles: true,
        composed: true
      })
    );

    if (typeof handleStyleChange === 'function') {
      handleStyleChange(newStyle);
    }
  };

  useEffect(() => {
    if (!data) {
      return;
    }

    geoJsonParser.readData(data).then((gsData) => setDataD(gsData));
  }, [data]);

  return (
    <div ref={hostRef}>
      <GeoStylerContext.Provider value={{ data: dataD, locale: locale.fr_FR }}>
        <Style style={geostylerStyle} onStyleChange={emitStyleChange} />
      </GeoStylerContext.Provider>
    </div>
  );
};

export const GeostylerWebComponent = r2wc(GeostylerStyleAdapter, {
  props: { geostylerStyle: 'json', handleStyleChange: 'method', data: 'json' }
});
