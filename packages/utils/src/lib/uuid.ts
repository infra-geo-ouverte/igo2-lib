export function S4() {

  return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}

export function uuid() {
  const id = `${S4()}${S4()}-${S4()}-${S4()}-${S4()}-${S4()}${S4()}${S4()}`;
  return id.toLowerCase();
}
