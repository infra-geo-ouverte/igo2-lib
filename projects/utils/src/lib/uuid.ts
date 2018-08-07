export function S4() {
  // tslint:disable-next-line: no-bitwise
  return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}

export function uuid() {
  const id = `${S4()}${S4()}-${S4()}-${S4()}-${S4()}-${S4()}${S4()}${S4()}`;
  return id.toLowerCase();
}
