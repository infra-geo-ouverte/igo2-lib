import { describe, expect, it } from 'vitest';

import { stringToLonLat } from './map.utils';

describe('stringToLonLat', () => {
  it('keeps coordinates unchanged when coord is in lon/lat', () => {
    const response = stringToLonLat('-73,46', 'EPSG:3857');

    expect(response.lonLat).toEqual([-73, 46]);
    expect(response.message).toBe('');
  });

  it('reprojects explicit EPSG:3857 coordinates to lon/lat', () => {
    const response = stringToLonLat('-8126322, 5780349', 'EPSG:3857');
    console.log(response);

    expect(response.lonLat?.[0]).toBeCloseTo(-72.99999256276718, 20);
    expect(response.lonLat?.[1]).toBeCloseTo(45.99999862555137, 20);
    expect(response.message).toBe('');
  });
});
