/* tslint:disable */
// See this issue: https://github.com/Microsoft/TypeScript/issues/13965
// And the solution: https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work
// for an explanation as to why the prototype is set manually
/* tslint:enable */

export class GeometrySliceError extends Error {}

export class GeometrySliceMultiPolygonError extends GeometrySliceError {
  constructor() {
    super('Can\'t slice a MultiPolygon.');
    Object.setPrototypeOf(this, GeometrySliceMultiPolygonError.prototype);
  }
}

export class GeometrySliceLineStringError extends GeometrySliceError {
  constructor() {
    super('Can\'t slice with a line that has more than 2 points.');
    Object.setPrototypeOf(this, GeometrySliceLineStringError.prototype);
  }
}

export class GeometrySliceTooManyIntersectionError extends GeometrySliceError {
  constructor() {
    super('More than 2 intersections found between the target polygon and the slicing line.');
    Object.setPrototypeOf(this, GeometrySliceTooManyIntersectionError.prototype);
  }
}
