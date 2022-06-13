export interface DOMOptions {
  id?: number;
  name?: string;
  url?: string;
  values?: DOMValue[];
}

export interface DOMValue {
  id: number | string;
  value: string;
}
