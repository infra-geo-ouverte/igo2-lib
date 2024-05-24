export interface EntityTablePaginatorOptions {
  disabled?: boolean; // Whether the component is disabled.
  hidePageSize?: boolean; // Whether to hide the page size selection UI from the user.
  pageIndex?: number; // The zero-based page index of the displayed list of items.
  pageSize?: number; // Number of items to display on a page.
  pageSizeOptions?: number[]; // The set of provided page size options to display to the user.
  showFirstLastButtons?: boolean; // Whether to show the first/last buttons UI to the user.
}
