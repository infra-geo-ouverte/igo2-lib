export enum OgcFilterOperatorType {
  BasicNumericOperator = 'basicnumericoperator',
  Basic = 'basic',
  BasicAndSpatial = 'basicandspatial',
  Spatial = 'spatial',
  All = 'all',
  Time = 'time'
}

export enum OgcFilterOperator {
  BBOX = 'BBox',
  PropertyIsBetween = 'PropertyIsBetween',
  Contains = 'Contains',
  During = 'During',
  PropertyIsEqualTo = 'PropertyIsEqualTo',
  PropertyIsGreaterThan = 'PropertyIsGreaterThan',
  PropertyIsGreaterThanOrEqualTo = 'PropertyIsGreaterThanOrEqualTo',
  Intersects = 'Intersects',
  PropertyIsNull = 'PropertyIsNull',
  PropertyIsLessThan = 'PropertyIsLessThan',
  PropertyIsLessThanOrEqualTo = 'PropertyIsLessThanOrEqualTo',
  PropertyIsLike = 'PropertyIsLike',
  PropertyIsNotEqualTo = 'PropertyIsNotEqualTo',
  Within = 'Within',
  And = 'And',
  Or = 'Or',
  Not = 'Not'
}
