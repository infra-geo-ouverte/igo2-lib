export class GoogleLinks {
  static getGoogleMapsLink(lon, lat) {
    return 'https://www.google.com/maps?q=' + lat + ',' + lon;
  }

  static getGoogleStreetViewLink(lon, lat) {
    return 'https://www.google.com/maps?q=&layer=c&cbll=' + lat + ',' + lon;
  }
}
