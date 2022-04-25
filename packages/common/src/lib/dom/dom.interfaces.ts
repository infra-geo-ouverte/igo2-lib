export interface DOMOptions {
  name: string;
  url?: string;
  value?: DOMValue[];
}

export interface DOMValue {
  id: number | string;
  value: string;
}
