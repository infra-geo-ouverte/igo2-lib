export class GoogleLinks {
  static getGoogleMapsCoordLink(lon, lat) {
    return 'https://www.google.com/maps?q=' + lat + ',' + lon;
  }

  static getGoogleStreetViewLink(lon, lat) {
    return 'https://www.google.com/maps?q=&layer=c&cbll=' + lat + ',' + lon;
  }

  static getGoogleMapsNameLink(name) {
    const encodedName = encodeURI(name);
    return 'https://www.google.com/maps?q=' + encodedName;
  }
}
