export enum OgcFilterOperatorType {
    BasicNumericOperator = 'basicnumericoperator',
    Basic = 'basic',
    BasicAndSpatial = 'basicandspatial',
    Spatial = 'spatial',
    All = 'all',
    Time = 'time'
}

export enum OgcFilterOperator {
    BBOX = 'bbox',
    PropertyIsBetween = 'propertyisbetween',
    Contains = 'contains',
    During = 'during',
    PropertyIsEqualTo = 'propertyisequalto',
    PropertyIsGreaterThan = 'propertyisgreaterthan',
    PropertyIsGreaterThanOrEqualTo = 'propertyisgreaterthanorequalto',
    Intersects = 'intersects',
    PropertyIsNull = 'propertyisnull',
    PropertyIsLessThan = 'propertyislessthan',
    PropertyIsLessThanOrEqualTo = 'propertyislessthanorequalto',
    PropertyIsLike = 'propertyislike',
    PropertyIsNotEqualTo = 'propertyisnotequalto',
    Within = 'within',
    And = 'and',
    Or = 'or',
    Not = 'not'
}
