export function printPerformance(message: string, start: number): void {
  const duration = getDuration(start);
  console.log(`${message} ${duration}ms`);
}

/** Duration in ms */
function getDuration(start: number): number {
  return Math.round(performance.now() - start);
}
