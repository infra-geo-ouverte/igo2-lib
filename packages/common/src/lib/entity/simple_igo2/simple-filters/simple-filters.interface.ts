export interface SimpleFilter {
    type: string;
    description: string;
}

export interface TypeValues {
    type: string;
    description: string;
    values: Array<Values>;
}

export interface Values {
    code: string;
    nom: string;
}
