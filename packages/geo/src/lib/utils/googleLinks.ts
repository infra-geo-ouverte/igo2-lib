export class GoogleLinks {
  static getGoogleMapsCoordLink(lon: number, lat: number) {
    return `https://www.google.com/maps/search/?api=1&query=${lat}%2C${lon}`;
  }

  static getGoogleStreetViewLink(lon: number, lat: number) {
    return `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat}%2C${lon}`;
  }

  static getGoogleMapsNameLink(name: string) {
    const encodedName = encodeURI(name);
    return `https://www.google.com/maps/search/?api=1&query=${encodedName}`;
  }
}
