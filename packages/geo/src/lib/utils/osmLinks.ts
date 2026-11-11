export class OsmLinks {
  static getOpenStreetMapLink(lon: number, lat: number, zoom = 17) {
    return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=${zoom}/${lat}/${lon}`;
  }

  static getOpenStreetCamLink(lon: number, lat: number, zoom = 17) {
    return `https://openstreetcam.org/map/@${lat},${lon},${zoom}z`;
  }
}
