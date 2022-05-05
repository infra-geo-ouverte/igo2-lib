export interface SimpleFilter {
    type: string;
    description: string;
}

export interface TypeValues {
    type: string;
    description: string;
    values: Array<Value>;
}

export interface Value {
    type: string;
    code: string;
    nom: string;
}
