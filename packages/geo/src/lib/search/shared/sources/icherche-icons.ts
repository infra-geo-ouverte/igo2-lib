import { ENGINE_ICON, IconSvg } from '@igo2/common/icon';

/**
 * Icons mappings to be retrocompatible with iCherche
 */
export const ICHERCHE_ICONS: Record<string, string | IconSvg> = {
  'map-marker': 'location_on',
  city: 'location_city',
  'flag-triangle': 'flag',
  'map-marker-alert': 'fmd_bad',
  'map-marker-radius': 'pin_drop',
  'map-marker-multiple': 'local_post_office',
  'map-legend': 'map',
  bank: 'account_balance',
  'map-search': 'search_insights',
  'book-open-variant': 'menu_book',
  'office-building': 'apartment',
  'table-picnic': 'table_restaurant',
  flash: 'flash_on',
  engine: ENGINE_ICON,
  'road-variant': 'add_road',
  'baby-face-outline': 'child_care',
  'home-account': 'location_home',
  hospital: 'local_hospital',
  pharmacy: 'local_pharmacy',
  'police-badge-outline': 'local_police',
  parking: 'local_parking',
  tree: 'nature',
  'home-city': 'home_work',
  terrain: 'landscape',
  'panorama-horizontal': 'panorama_horizontal'
};
