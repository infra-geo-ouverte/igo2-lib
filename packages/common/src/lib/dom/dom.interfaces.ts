export interface DOMOptions {
  id?: number;
  name?: string;
  url?: string;
  value?: DOMValue[];
}

export interface DOMValue {
  id: number | string;
  value: string;
}
