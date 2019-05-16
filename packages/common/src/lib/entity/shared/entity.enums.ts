export enum EntityOperationType {
  Insert = 'Insert',
  Update = 'Update',
  Delete = 'Delete'
}

export enum EntityTableColumnRenderer {
  Default = 'Default',
  HTML = 'HTML',
  UnsanitizedHTML = 'UnsanitizedHTML',
  Icon = 'Icon',
  ButtonGroup = 'ButtonGroup'
}

export enum EntityTableScrollBehavior {
  Auto = 'auto',
  Instant = 'instant',
  Smooth = 'smooth'
}

export enum EntityTableSelectionState {
  None = 'None',
  All = 'All',
  Some = 'Some'
}
