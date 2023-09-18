export interface CoordinatesData {
  coord: [number, number];
}

export interface CoordinatesResponse {
  features: CoordinatesData[];
}

export interface CoordinatesReverseData {
  coord: [number, number];
}

export interface CoordinatesReverseResponse {
  features: CoordinatesData[];
}
