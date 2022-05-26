export interface SimpleFilters {
    type: "attribute" | "spatial";
    filters: Array<SimpleFilter>;
}

export interface SimpleFilter {
    type: string;
    description: string;
}

export interface TypeOptions {
    type: string;
    description: string;
    options?: Array<Option>;
}

export interface Option {
    type: string;
    code: string;
    nom: string;
}
