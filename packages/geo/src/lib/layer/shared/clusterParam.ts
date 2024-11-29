export interface ClusterParam {
  clusterRanges?: ClusterRange[];
  radiusCalc?: (size: number) => number;
}

export interface ClusterRange {
  minRadius?: number;
  maxRadius?: number;
  showRange?: boolean;
  dynamicRadius?: boolean;
  style: Record<string, any>;
}
