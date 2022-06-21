export interface SimpleEntityList {
  layerId: string; // the layerId from which the entities are extracted
  attributeOrder: AttributeOrder; // the order in which the attributes are shown in the list (see AttributeOrder)
  sortBy?: SortBy; // sort the entities by a given attribute (see SortBy)
  formatURL?: boolean; // format an URL to show a description (true) or the whole URL (false)
  formatEmail?: boolean; // format an URL to show a description (true) or the who email address (false)
  paginator?: Paginator; // paginator (see Paginator)
}

export interface AttributeOrder {
  attributeName: string; // name of the attribute in the data source
  personalizedFormatting?: string; // string used to merge multiple attributes
  description?: string; // description to put in front of the value of the attribute
  header?: string; // HTML header to use (ex. "h2")
}

export interface SortBy {
  attributeName: string; // the attribute used for the sort
  order?: string; // order of the sort (ascending or descending)
}

export interface Paginator {
  pageSize?: number; // the number of entities per page
  showFirstLastPageButtons?: boolean; // show the "Go to First Page" and "Go to Last Page" buttons
  showPreviousNextPageButtons?: boolean; // show the "Go to Previous Page" and "Go to Next Page" buttons
}
