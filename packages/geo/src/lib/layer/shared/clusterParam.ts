export interface ClusterParam {
  clusterRanges?: ClusterRange[];
  radiusCalc?: (size: number) => number;
}

export interface ClusterRange {
  minRadius?: number;
  maxRadius?: number;
  style: { [key: string]: any };
}
