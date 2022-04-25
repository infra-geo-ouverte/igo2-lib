export interface DOMOptions {
  name: string;
  url?: string;
  value?: DOMValue[];
}

export interface DOMValue {
  id: number;
  value: string;
}
