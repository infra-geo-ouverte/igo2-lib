export class OsmLinks {
  static getOpenStreetMapLink(lon, lat, zoom: number = 17) {
    return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=${zoom}/${lat}/${lon}`;
  }

  static getOpenStreetCamLink(lon, lat, zoom: number = 17) {
    return `https://openstreetcam.org/map/@${lat},${lon},${zoom}z`;
  }
}
